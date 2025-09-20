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
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  images: string[] | null;
  video: string | null;
  category: string | null;
  created_at?: string;
  updated_at?: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
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
    images: [],
    video: '',
    category: ''
  });
  const [newProductImages, setNewProductImages] = useState<File[]>([]);
  const [newProductVideo, setNewProductVideo] = useState<File | null>(null);
  
  const { toast } = useToast();
  const { isAuthenticated, user } = useAdmin();
  
  // Predefined categories for the dropdown
  const predefinedCategories = ['Electronics', 'Clothing', 'Accessories', 'Home', 'Sports', 'Books', 'Beauty', 'Toys', 'Automotive', 'Garden'];
  const categories = ['All', ...predefinedCategories, ...Array.from(new Set(products.map(p => p.category).filter(cat => !predefinedCategories.includes(cat))))];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error(error);
    } else {
      setProducts(data as Product[]);
    }
  };

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

  const handleFileUpload = async (file: File) => {
    const { data, error } = await supabase.storage
      .from('product-media')
      .upload(`${file.name}-${Date.now()}`, file);

    if (error) {
      console.error(error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-media')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Close modal immediately for better UX
    setIsAddModalOpen(false);

    // Show loading toast
    toast({
      title: "Adding Product",
      description: "Please wait while we add your product...",
    });

    try {
      let imageUrl = newProduct.image;
      let videoUrl = newProduct.video;
      let imageUrls: string[] = [];

      // Upload main image if it's a file
      if (newProduct.image && typeof newProduct.image === 'object' && newProduct.image instanceof File) {
        imageUrl = await handleFileUpload(newProduct.image);
      }

      // Upload additional images
      if (newProductImages.length > 0) {
        const uploadPromises = newProductImages.map(file => handleFileUpload(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        imageUrls = uploadedUrls.filter(url => url !== null) as string[];
      }

      // Upload video if it's a file
      if (newProductVideo) {
        videoUrl = await handleFileUpload(newProductVideo);
      }

      // Combine main image with additional images
      const allImages = [imageUrl, ...imageUrls].filter(url => url && url !== '');

      const { data, error } = await supabase.from('products').insert([
        {
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          image: imageUrl as string,
          images: allImages,
          video: videoUrl as string,
          category: newProduct.category,
        },
      ]);

      if (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to add product",
          variant: "destructive",
        });
        // Re-open modal on error so user can try again
        setIsAddModalOpen(true);
      } else {
        fetchProducts();
        toast({
          title: "Success",
          description: "Product added successfully",
        });
        setNewProduct({ name: '', description: '', price: 0, image: '', images: [], video: '', category: '' });
        setNewProductImages([]);
        setNewProductVideo(null);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding the product",
        variant: "destructive",
      });
      // Re-open modal on error
      setIsAddModalOpen(true);
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;

    let imageUrl = selectedProduct.image;
    let videoUrl = selectedProduct.video;
    let imageUrls: string[] = selectedProduct.images || [];

    if (selectedProduct.image && typeof selectedProduct.image === 'object' && selectedProduct.image instanceof File) {
      imageUrl = await handleFileUpload(selectedProduct.image);
    }

    if (selectedProduct.video && typeof selectedProduct.video === 'object' && selectedProduct.video instanceof File) {
      videoUrl = await handleFileUpload(selectedProduct.video);
    }

    // Combine main image with additional images
    const allImages = [imageUrl, ...imageUrls].filter(url => url && url !== '');

    const { data, error } = await supabase
      .from('products')
      .update({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        image: imageUrl as string,
        images: allImages,
        video: videoUrl as string,
        category: selectedProduct.category,
      })
      .eq('id', selectedProduct.id);

    if (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } else {
      fetchProducts();
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setIsEditModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      // Ensure user is authenticated before attempting deletion
      if (!isAuthenticated || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in as an admin to delete products.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from('products').delete().eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        // Check if it's an authentication error
        if (error.code === 'PGRST301' || error.message.includes('JWT')) {
          toast({
            title: "Authentication Error",
            description: "Please log in again as an admin to perform this action.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to delete product: ${error.message}`,
            variant: "destructive",
          });
        }
        return;
      }

      // Update local state only after successful database deletion
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (err) {
      console.error('Unexpected error during product deletion:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the product.",
        variant: "destructive",
      });
    }
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
                  <Label htmlFor="image">Main Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.files ? e.target.files[0] : null})}
                  />
                </div>
                <div>
                  <Label htmlFor="images">Additional Images</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files);
                        setNewProductImages(prev => [...prev, ...files]);
                      }
                    }}
                  />
                  {newProductImages.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-muted-foreground">Selected images:</p>
                      <div className="flex flex-wrap gap-2">
                        {newProductImages.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                            <span className="text-sm truncate max-w-[100px]">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => setNewProductImages(prev => prev.filter((_, i) => i !== index))}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="video">Video</Label>
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setNewProductVideo(e.target.files ? e.target.files[0] : null)}
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
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                  {product.images && product.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm text-foreground px-2 py-1 rounded-full text-xs font-medium">
                      +{product.images.length - 1} more
                    </div>
                  )}
                  {product.video && (
                    <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm text-foreground px-2 py-1 rounded-full text-xs font-medium">
                      📹 Video
                    </div>
                  )}
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
                  <Label htmlFor="edit-image">Main Image</Label>
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedProduct({...selectedProduct, image: e.target.files ? e.target.files[0] : ''})}
                  />
                  {selectedProduct.image && typeof selectedProduct.image === 'string' && (
                    <div className="mt-2">
                      <img src={selectedProduct.image} alt="Current image" className="w-20 h-20 object-cover rounded" />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-images">Additional Images</Label>
                  <Input
                    id="edit-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files);
                        setSelectedProduct({...selectedProduct, images: [...(selectedProduct.images || []), ...files.map(f => f.name)]});
                      }
                    }}
                  />
                  {selectedProduct.images && selectedProduct.images.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-muted-foreground">Current images:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.images.map((img, index) => (
                          <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                            {typeof img === 'string' && img.startsWith('http') ? (
                              <img src={img} alt={`Image ${index + 1}`} className="w-8 h-8 object-cover rounded" />
                            ) : (
                              <span className="text-sm truncate max-w-[100px]">{img}</span>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedProduct({...selectedProduct, images: selectedProduct.images?.filter((_, i) => i !== index)})}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-video">Video</Label>
                  <Input
                    id="edit-video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setSelectedProduct({...selectedProduct, video: e.target.files ? e.target.files[0] : ''})}
                  />
                  {selectedProduct.video && typeof selectedProduct.video === 'string' && (
                    <div className="mt-2">
                      <video src={selectedProduct.video} className="w-32 h-20 object-cover rounded" controls />
                    </div>
                  )}
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
