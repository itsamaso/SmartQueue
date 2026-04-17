import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, Package, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import AuthGuard from "../components/AuthGuard";


function ProductsContent() {
  const navigate = useNavigate();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('order'),
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: '#1E1E1E' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: '#000000', borderColor: 'rgba(222,198,167,0.2)' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Home"))}
            className="w-10 h-10 rounded-full border transition-all hover:opacity-80"
            style={{ background: 'rgba(222,198,167,0.08)', borderColor: 'rgba(222,198,167,0.25)', color: '#DEC6A7' }}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black" style={{ color: '#DEC6A7' }}>המוצרים שלנו</h1>
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#DEC6A7' }}>
              <Package className="w-4 h-4 text-[#1E1E1E]" />
            </div>
          </div>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">


        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-2xl mb-2" style={{ background: '#3A3D44' }} />
                <div className="h-4 rounded w-3/4 mb-1" style={{ background: '#3A3D44' }} />
                <div className="h-4 rounded w-1/2" style={{ background: '#3A3D44' }} />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(222,198,167,0.08)' }}>
              <Package className="w-10 h-10" style={{ color: 'rgba(222,198,167,0.4)' }} />
            </div>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>אין מוצרים זמינים כרגע</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="rounded-2xl overflow-hidden border-2 transition-all duration-300" style={{ background: '#3A3D44', borderColor: 'rgba(222,198,167,0.25)' }} onMouseEnter={e => e.currentTarget.style.borderColor='#DEC6A7'} onMouseLeave={e => e.currentTarget.style.borderColor='rgba(222,198,167,0.25)'}>
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden" style={{ background: '#2A2A2A' }}>
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Price Badge */}
                    <div className="absolute top-2 right-2 flex items-center">
                      <div className="relative px-3 py-1.5 rounded-r-lg" style={{ background: '#DEC6A7', clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 15% 100%, 0% 50%)' }}>
                        <span className="font-black text-base leading-none" style={{ color: '#1E1E1E' }}>{product.price} ₪</span>
                      </div>
                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Product Info */}
                  <div className="p-3" style={{ background: '#3A3D44' }}>
                    <h3 className="font-black text-base text-center truncate drop-shadow-lg" style={{ color: '#DEC6A7' }}>
                      {product.name}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}


      </div>


    </div>
  );
}

export default function Products() {
  return (
    <AuthGuard>
      <ProductsContent />
    </AuthGuard>
  );
}