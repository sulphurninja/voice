import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Agent from '@/models/agentModel';
import KnowledgeDocument from '@/models/knowledgeModel'; // Add this import
import { getUserFromRequest } from '@/lib/jwt';
import { getAgent, updateAgent, deleteAgent } from '@/lib/elevenLabs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    // Find the agent by agentId
    const agent = await Agent.findOne({
      agentId: id,
      userId: typeof userData === 'object' ? userData.userId : userData
    });

    if (!agent) {
      return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
    }

    // Get user's knowledge documents to show available options
    const userId = typeof userData === 'object' ? userData.userId : userData;
    const availableKnowledge = await KnowledgeDocument.find({ userId }).sort({ createdAt: -1 });

    // Format the response to match the expected structure
    const formattedAgent = {
      _id: agent._id,
      agent_id: agent.agentId,
      name: agent.name,
      description: agent.description,
      disabled: agent.disabled,
      voice_id: agent.voiceId,
      voiceName: agent.voiceName,
      usage_minutes: agent.usageMinutes,
      last_called_at: agent.lastCalledAt,
      template_id: agent.templateId,
      template_name: agent.templateName,
      llm_model: agent.llmModel,
      temperature: agent.temperature,
      language: agent.language,
      max_duration_seconds: agent.maxDurationSeconds,
      knowledge_documents: agent.knowledgeDocuments,
      available_knowledge: availableKnowledge, // Include available knowledge documents
      tools: agent.tools,
      conversation_config: {
        first_message: agent.firstMessage,
        system_prompt: agent.systemPrompt,
        enable_summary: true,
      },
    };

    return NextResponse.json(formattedAgent);
  } catch (error: any) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { message: 'Failed to fetch agent', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    // Find the agent by agentId
    const agent = await Agent.findOne({
      agentId: id,
      userId: typeof userData === 'object' ? userData.userId : userData
    });

    if (!agent) {
      console.error(`Agent not found in database: ${id}`);
      return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
    }

    const updates = await request.json();
    console.log("Updating agent with data:", updates);

    const userId = typeof userData === 'object' ? userData.userId : userData;
    let processedKnowledgeDocuments = [];

    // Handle knowledge documents
    if (updates.knowledge_documents) {
      // Always include global knowledge documents
      const globalDocs = await KnowledgeDocument.find({ userId, isGlobal: true });
      processedKnowledgeDocuments.push(...globalDocs.map(doc => ({
        document_id: doc.elevenLabsDocumentId,
        name: doc.name,
        type: doc.type,
        content: doc.content,
        url: doc.url,
        created_at: doc.uploadedAt
      })).filter(doc => doc.document_id));

      // Process specific knowledge documents for this agent
      for (const doc of updates.knowledge_documents) {
        try {
          // If it's an existing document from knowledge base (has _id), use it
          if (doc._id) {
            const existingDoc = await KnowledgeDocument.findOne({ _id: doc._id, userId });
            if (existingDoc && existingDoc.elevenLabsDocumentId) {
              processedKnowledgeDocuments.push({
                document_id: existingDoc.elevenLabsDocumentId,
                name: existingDoc.name,
                type: existingDoc.type,
                content: existingDoc.content,
                url: existingDoc.url,
                created_at: existingDoc.uploadedAt
              });
              continue;
            }
          }

          // If it's an existing document (has document_id), keep it
          if (doc.document_id) {
            processedKnowledgeDocuments.push(doc);
            continue;
          }

          // Skip empty new documents
          if (!doc.content && !doc.url) {
            continue;
          }

          // Create FormData for new documents
          const formData = new FormData();

          if (doc.type === 'text' && doc.content) {
            const tempFile = new File([doc.content], "content.txt", { type: "text/plain" });
            formData.append("file", tempFile);
            formData.append("name", doc.name || "Text Document");
          } else if (doc.type === 'url' && doc.url) {
            formData.append("url", doc.url);
            formData.append("name", doc.name || "URL Document");
          } else {
            continue;
          }

          // Upload to ElevenLabs knowledge base
          const kbRes = await fetch("https://api.elevenlabs.io/v1/convai/knowledge-base", {
            method: "POST",
            headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! },
            body: formData
          });

          if (!kbRes.ok) {
            console.error("Failed to upload knowledge document");
            continue;
          }

          const kbData = await kbRes.json();
          const documentData = {
            document_id: kbData.id || kbData.document_id,
            name: doc.name || kbData.name || 'Document',
            type: doc.type,
            content: doc.type === 'text' ? doc.content : undefined,
            url: doc.type === 'url' ? doc.url : undefined,
            created_at: new Date()
          };

          processedKnowledgeDocuments.push(documentData);

          // Save to knowledge base if it's not temporary
          if (!doc.isTemporary) {
            const knowledgeDoc = new KnowledgeDocument({
              userId,
              name: documentData.name,
              type: documentData.type,
              content: documentData.content,
              url: documentData.url,
              elevenLabsDocumentId: documentData.document_id,
              isGlobal: false,
              agentIds: [agent._id],
              uploadedAt: new Date(),
            });
            await knowledgeDoc.save();
          }

        } catch (error) {
          console.error("Error processing document:", error);
        }
      }
    } else {
      // If no knowledge_documents in updates, keep existing ones plus global
      const globalDocs = await KnowledgeDocument.find({ userId, isGlobal: true });
      processedKnowledgeDocuments = [
        ...agent.knowledgeDocuments,
        ...globalDocs.map(doc => ({
          document_id: doc.elevenLabsDocumentId,
          name: doc.name,
          type: doc.type,
          content: doc.content,
          url: doc.url,
          created_at: doc.uploadedAt
        })).filter(doc => doc.document_id && !agent.knowledgeDocuments.some(existing => existing.document_id === doc.document_id))
      ];
    }

    // Add the processed knowledge documents to updates
    const updatesWithKnowledge = {
      ...updates,
      knowledge_documents: processedKnowledgeDocuments
    };

    console.log(`Attempting to update ElevenLabs agent: ${id}`);

    try {
      // Update the agent via ElevenLabs API
      await updateAgent(id, updatesWithKnowledge);
    } catch (elevenLabsError: any) {
      console.error("ElevenLabs API error:", elevenLabsError);
      // Continue with database update even if ElevenLabs fails
      // You might want to handle this differently based on your requirements
    }

    // In the PATCH function, when updating the database, add:

    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.first_message) updateData.firstMessage = updates.first_message;
    if (updates.system_prompt) updateData.systemPrompt = updates.system_prompt;
    if (updates.voice_id) updateData.voiceId = updates.voice_id;

    // Voice Configuration
    if (updates.voiceStability !== undefined) updateData.voiceStability = updates.voiceStability;
    if (updates.voiceSimilarityBoost !== undefined) updateData.voiceSimilarityBoost = updates.voiceSimilarityBoost;
    if (updates.voiceSpeed !== undefined) updateData.voiceSpeed = updates.voiceSpeed;
    if (updates.optimizeStreamingLatency !== undefined) updateData.optimizeStreamingLatency = updates.optimizeStreamingLatency;
    if (updates.outputAudioFormat) updateData.outputAudioFormat = updates.outputAudioFormat;

    // LLM Settings
    if (updates.llm_model) updateData.llmModel = updates.llm_model;
    if (updates.temperature !== undefined) updateData.temperature = updates.temperature;
    if (updates.maxTokens !== undefined) updateData.maxTokens = updates.maxTokens;
    if (updates.language) updateData.language = updates.language;

    // Advanced Settings
    if (updates.max_duration_seconds) updateData.maxDurationSeconds = updates.max_duration_seconds;
    if (updates.turnTimeout !== undefined) updateData.turnTimeout = updates.turnTimeout;
    if (updates.silenceEndCallTimeout !== undefined) updateData.silenceEndCallTimeout = updates.silenceEndCallTimeout;
    if (typeof updates.textOnly === 'boolean') updateData.textOnly = updates.textOnly;
    if (updates.asrModel) updateData.asrModel = updates.asrModel;
    if (updates.asrQuality) updateData.asrQuality = updates.asrQuality;
    if (updates.asrLanguage) updateData.asrLanguage = updates.asrLanguage;
    if (typeof updates.ragEnabled === 'boolean') updateData.ragEnabled = updates.ragEnabled;
    if (typeof updates.backgroundVoiceDetection === 'boolean') updateData.backgroundVoiceDetection = updates.backgroundVoiceDetection;
    if (typeof updates.disableFirstMessageInterruptions === 'boolean') updateData.disableFirstMessageInterruptions = updates.disableFirstMessageInterruptions;

    // Built-in Tools
    if (typeof updates.enableEndCall === 'boolean') updateData.enableEndCall = updates.enableEndCall;
    if (typeof updates.enableLanguageDetection === 'boolean') updateData.enableLanguageDetection = updates.enableLanguageDetection;
    if (typeof updates.enableTransferToAgent === 'boolean') updateData.enableTransferToAgent = updates.enableTransferToAgent;
    if (typeof updates.enableTransferToNumber === 'boolean') updateData.enableTransferToNumber = updates.enableTransferToNumber;
    if (typeof updates.enableSkipTurn === 'boolean') updateData.enableSkipTurn = updates.enableSkipTurn;
    if (typeof updates.enableKeypadTouchTone === 'boolean') updateData.enableKeypadTouchTone = updates.enableKeypadTouchTone;
    if (typeof updates.enableVoicemailDetection === 'boolean') updateData.enableVoicemailDetection = updates.enableVoicemailDetection;
    if (typeof updates.disabled === 'boolean') updateData.disabled = updates.disabled;
    if (updates.llm_model) updateData.llmModel = updates.llm_model;
    if (updates.temperature !== undefined) updateData.temperature = updates.temperature;
    if (updates.language) updateData.language = updates.language;
    if (updates.max_duration_seconds) updateData.maxDurationSeconds = updates.max_duration_seconds;
    if (processedKnowledgeDocuments.length > 0) updateData.knowledgeDocuments = processedKnowledgeDocuments;
    if (updates.tools) updateData.tools = updates.tools;

    // Always ensure system tools are present
    const { getDefaultSystemTools } = await import('@/lib/systemTools');
    updateData.systemTools = getDefaultSystemTools();

    await Agent.findOneAndUpdate(
      { agentId: id },
      updateData,
      { new: true }
    );

    return NextResponse.json({ success: true, message: "Agent updated successfully" });
  } catch (error: any) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { message: 'Failed to update agent', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userData = await getUserFromRequest(request);
    if (!userData || typeof userData === 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    // Find the agent by agentId
    const agent = await Agent.findOne({
      agentId: id,
      userId: typeof userData === 'object' ? userData.userId : userData
    });

    if (!agent) {
      return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
    }

    // Remove this agent from any knowledge documents that reference it
    const userId = typeof userData === 'object' ? userData.userId : userData;
    await KnowledgeDocument.updateMany(
      { userId, agentIds: agent._id },
      { $pull: { agentIds: agent._id } }
    );

    await deleteAgent(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { message: 'Failed to delete agent', error: error.message },
      { status: 500 }
    );
  }
}
