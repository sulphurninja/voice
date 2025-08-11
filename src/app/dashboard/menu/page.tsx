"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UtensilsCrossed,
  Plus,
  Edit3,
  Trash2,
  Clock,
  DollarSign,
  Eye,
  EyeOff,
  Star,
  AlertTriangle,
} from "lucide-react";

type MenuItem = {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  currency: string;
  available: boolean;
  imageUrl?: string;
  ingredients?: string[];
  allergens?: string[];
  preparationTime: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

const categories = [
  { value: 'appetizer', label: 'Appetizers' },
  { value: 'main_course', label: 'Main Course' },
  { value: 'dessert', label: 'Desserts' },
  { value: 'beverage', label: 'Beverages' },
  { value: 'side_dish', label: 'Side Dishes' },
  { value: 'salad', label: 'Salads' },
  { value: 'soup', label: 'Soups' },
  { value: 'other', label: 'Other' },
];

export default function MenuPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'main_course',
    price: 0,
    preparationTime: 15,
    ingredients: '',
    allergens: '',
    tags: '',
    available: true,
  });

  useEffect(() => {
    fetchMenuItems();
  }, [categoryFilter]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const url = `/api/menu${categoryFilter !== "all" ? `?category=${categoryFilter}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();
      setMenuItems(data.items || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const itemData = {
        ...formData,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
        allergens: formData.allergens.split(',').map(a => a.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      const url = selectedItem ? `/api/menu/${selectedItem._id}` : '/api/menu';
      const method = selectedItem ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        fetchMenuItems();
        setIsAddDialogOpen(false);
        setIsEditDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: item.price,
      preparationTime: item.preparationTime,
      ingredients: item.ingredients?.join(', ') || '',
      allergens: item.allergens?.join(', ') || '',
      tags: item.tags.join(', '),
      available: item.available,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  const toggleAvailability = async (itemId: string, available: boolean) => {
    try {
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available }),
      });

      if (response.ok) {
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'main_course',
      price: 0,
      preparationTime: 15,
      ingredients: '',
      allergens: '',
      tags: '',
      available: true,
    });
    setSelectedItem(null);
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      appetizer: 'bg-orange-100 text-orange-800',
      main_course: 'bg-blue-100 text-blue-800',
      dessert: 'bg-pink-100 text-pink-800',
      beverage: 'bg-cyan-100 text-cyan-800',
      side_dish: 'bg-yellow-100 text-yellow-800',
      salad: 'bg-green-100 text-green-800',
      soup: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };

    const color = colors[category as keyof typeof colors] || colors.other;

    return (
      <Badge className={color}>
        {categories.find(c => c.value === category)?.label || category}
      </Badge>
    );
  };

  const MenuForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Item Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <Label htmlFor="preparationTime">Prep Time (minutes)</Label>
          <Input
            id="preparationTime"
            type="number"
            value={formData.preparationTime}
            onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 15 })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
        <Input
          id="ingredients"
          value={formData.ingredients}
          onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
          placeholder="Tomatoes, Onions, Spices..."
        />
      </div>

      <div>
        <Label htmlFor="allergens">Allergens (comma-separated)</Label>
        <Input
          id="allergens"
          value={formData.allergens}
          onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
          placeholder="Nuts, Dairy, Gluten..."
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="Spicy, Vegetarian, Popular..."
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="available"
          checked={formData.available}
          onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
        />
        <Label htmlFor="available">Available for ordering</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {selectedItem ? 'Update Item' : 'Add Item'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <DashboardHeader />
        
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <UtensilsCrossed className="h-8 w-8" />
                  Menu Management
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage your restaurant menu items
                </p>
              </div>
              
              <div className="flex gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Menu Item</DialogTitle>
                    </DialogHeader>
                    <MenuForm />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : menuItems.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <UtensilsCrossed className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No menu items found</h3>
                <p className="text-muted-foreground mb-6">
                  Start building your menu by adding your first item
                </p>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Menu Item</DialogTitle>
                    </DialogHeader>
                    <MenuForm />
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              menuItems.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`relative ${!item.available ? 'opacity-75' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {item.name}
                            {!item.available && <EyeOff className="h-4 w-4 text-muted-foreground" />}
                          </CardTitle>
                          <div className="flex gap-2 mt-2">
                            {getCategoryBadge(item.category)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">₹{item.price}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {item.preparationTime}m
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {item.allergens && item.allergens.length > 0 && (
                        <div className="flex items-center gap-1 mb-3">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          <span className="text-xs text-muted-foreground">
                            Contains: {item.allergens.join(', ')}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="flex-1"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAvailability(item._id, !item.available)}
                        >
                          {item.available ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item._id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <MenuForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}