import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Upload, Package, Edit, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ProductsTab({ products }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const createProductMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); resetForm(); setShowDialog(false); }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); resetForm(); setShowDialog(false); }
  });

  const resetForm = () => { setImageUrl(""); setProductName(""); setProductPrice(""); setEditingProduct(null); };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setImageUrl(product.image_url);
    setProductName(product.name);
    setProductPrice(product.price.toString());
    setShowDialog(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageUrl || !productName || !productPrice) return;
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: { name: productName, price: parseFloat(productPrice), image_url: imageUrl } });
    } else {
      createProductMutation.mutate({ name: productName, price: parseFloat(productPrice), image_url: imageUrl, order: products.length + 1 });
    }
  };

  return (
    <div className="rounded-3xl p-4 md:p-6" style={{ background: 'rgba(222,198,167,0.06)', border: '1px solid rgba(222,198,167,0.2)' }}>
      <div className="flex items-center justify-center gap-3 mb-6">
        <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="font-bold rounded-xl" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}>
              <Plus className="w-4 h-4 ml-2" />
              הוסף מוצר
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" style={{ background: '#1E1E1E', border: '1px solid rgba(222,198,167,0.3)' }}>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold" style={{ color: '#DEC6A7' }}>
                {editingProduct ? 'עריכת מוצר' : 'הוספת מוצר חדש'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>תמונת מוצר</Label>
                {imageUrl ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(222,198,167,0.3)' }}>
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 left-2 rounded-full" onClick={() => setImageUrl("")}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Label htmlFor="product-image" className="cursor-pointer">
                    <div className="w-full h-48 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors" style={{ border: '2px dashed rgba(222,198,167,0.3)', background: 'rgba(255,255,255,0.04)' }}>
                      {uploading ? (
                        <div className="animate-pulse" style={{ color: '#DEC6A7' }}>מעלה...</div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8" style={{ color: '#DEC6A7' }} />
                          <span style={{ color: 'rgba(255,255,255,0.4)' }}>לחץ להעלאת תמונה</span>
                        </>
                      )}
                    </div>
                    <Input id="product-image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </Label>
                )}
              </div>
              <div>
                <Label className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>שם מוצר</Label>
                <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="לדוגמה: ג'ל שיער" className="rounded-xl text-right text-white" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }} required />
              </div>
              <div>
                <Label className="text-right block mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>מחיר (₪)</Label>
                <Input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="0" className="rounded-xl text-right text-white" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(222,198,167,0.25)' }} required min="0" step="0.01" />
              </div>
              <Button type="submit" disabled={!imageUrl || !productName || !productPrice || createProductMutation.isPending || updateProductMutation.isPending} className="w-full font-bold rounded-xl disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)', color: '#1E1E1E' }}>
                {editingProduct ? 'עדכן מוצר' : 'הוסף מוצר'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          onClick={() => setEditMode(!editMode)}
          className="font-bold rounded-xl"
          style={editMode
            ? { background: 'rgba(222,198,167,0.15)', border: '1px solid rgba(222,198,167,0.4)', color: '#DEC6A7' }
            : { background: 'transparent', border: '1px solid rgba(222,198,167,0.35)', color: '#DEC6A7' }}
        >
          {editMode ? <X className="w-4 h-4 ml-2" /> : <Edit className="w-4 h-4 ml-2" />}
          {editMode ? 'ביטול עריכה' : 'עריכה'}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className={`relative group rounded-2xl overflow-hidden transition-all ${editMode ? 'cursor-pointer' : ''}`}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: editMode ? '1px solid rgba(222,198,167,0.4)' : '1px solid rgba(222,198,167,0.12)'
            }}
            onClick={() => editMode && openEditDialog(product)}
          >
            <div className="aspect-square">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <p className="text-white font-bold text-sm truncate">{product.name}</p>
              <p className="font-black" style={{ color: '#DEC6A7' }}>{product.price} ₪</p>
            </div>
            {editMode && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)' }}>
                  <Edit className="w-5 h-5 text-black" />
                </div>
              </div>
            )}
            {!editMode && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity rounded-full bg-red-900 hover:bg-red-800"
                onClick={(e) => { e.stopPropagation(); if (confirm('למחוק מוצר זה?')) deleteProductMutation.mutate(product.id); }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>אין מוצרים עדיין</p>
        </div>
      )}
    </div>
  );
}