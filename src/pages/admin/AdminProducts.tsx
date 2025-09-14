import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  DollarSign
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import productsData from '@/data/products.json';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>(productsData);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(productsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: ''
  });
  
  const { toast } = useToast();
  
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const product: Product = {
      ...newProduct,
      id: Math.max(...products.map(p => p.id)) + 1,
      image: newProduct.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop'
    };

    setProducts([...products, product]);
    console.log('Added product:', product);
    
    toast({
      title: "Success",
      description: "Product added successfully",
    });
    
    setNewProduct({ name: '', description: '', price: 0, image: '', category: '' });
    setIsAddModalOpen(false);
  };

  const handleEditProduct = () => {
    if (!selectedProduct) return;

    const updatedProducts = products.map(p => 
      p.id === selectedProduct.id ? selectedProduct : p
    );
    
    setProducts(updatedProducts);
    console.log('Updated product:', selectedProduct);
    
    toast({
      title: "Success",
      description: "Product updated successfully",
    });
    
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (productId: number) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    console.log('Deleted product ID:', productId);
    
    toast({
      title: "Success",
      description: "Product deleted successfully",
    });
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct({ ...product });
    setIsEditModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your store products</p>
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Fill in the product details below
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Enter product description"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== 'All').map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="image">Image URL (optional)</Label>
                  <Input
                    id="image"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddProduct} className="flex-1">
                    Add Product
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{product.category}</Badge>
                      <span className="text-lg font-bold text-price">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(product)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first product'
              }
            </p>
            {!searchTerm && selectedCategory === 'All' && (
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>
        )}

        {/* Edit Product Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update the product details below
              </DialogDescription>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedProduct.name}
                    onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={selectedProduct.description}
                    onChange={(e) => setSelectedProduct({...selectedProduct, description: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={selectedProduct.price}
                    onChange={(e) => setSelectedProduct({...selectedProduct, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={selectedProduct.category} 
                    onValueChange={(value) => setSelectedProduct({...selectedProduct, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== 'All').map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-image">Image URL</Label>
                  <Input
                    id="edit-image"
                    value={selectedProduct.image}
                    onChange={(e) => setSelectedProduct({...selectedProduct, image: e.target.value})}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleEditProduct} className="flex-1">
                    Update Product
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;