import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Upload, Clock, Scissors } from "lucide-react";

const EMPTY_FORM = { name: "", price: "", duration_minutes: "", description: "", gender: "male", background_image_url: "" };

export default function ServicesTab() {
  const queryClient = useQueryClient();
  const [filterGender, setFilterGender] = useState("male");
  const [filterEnabled, setFilterEnabled] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => base44.entities.Service.list("price"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["services"] }); closeDialog(); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["services"] }); closeDialog(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] })
  });

  const openCreate = () => {
    setEditingService(null);
    setForm({ ...EMPTY_FORM, gender: filterEnabled ? filterGender : "male" });
    setShowDialog(true);
  };

  const openEdit = (service) => {
    setEditingService(service);
    setForm({
      name: service.name || "",
      price: service.price?.toString() || "",
      duration_minutes: service.duration_minutes?.toString() || "",
      description: service.description || "",
      gender: service.gender || "male",
      background_image_url: service.background_image_url || ""
    });
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingService(null);
    setForm(EMPTY_FORM);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, background_image_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.duration_minutes) return;
    const data = {
      name: form.name,
      price: parseFloat(form.price),
      duration_minutes: parseInt(form.duration_minutes),
      description: form.description,
      gender: form.gender,
      background_image_url: form.background_image_url || null
    };
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredServices = services.filter(s =>
    !filterEnabled || (s.gender || "male") === filterGender
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="tab-content rounded-2xl p-3" style={{ background: "rgba(222,198,167,0.06)", border: "1px solid rgba(222,198,167,0.2)" }}>

      {/* Top bar */}
      <div className="flex flex-col gap-3 mb-4" dir="rtl">
        {/* Gender filter */}
        <div className="flex gap-2 w-full">
          <button type="button"
            onClick={() => { setFilterGender("male"); setFilterEnabled(true); }}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
            style={filterEnabled && filterGender === "male"
              ? { background: "linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)", color: "#1E1E1E" }
              : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(222,198,167,0.25)", color: "rgba(255,255,255,0.6)" }}>
            גברים
          </button>
          <button type="button"
            onClick={() => { setFilterGender("female"); setFilterEnabled(true); }}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
            style={filterEnabled && filterGender === "female"
              ? { background: "linear-gradient(135deg, #e8a0c0 0%, #c970a0 100%)", color: "#1E1E1E" }
              : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(222,198,167,0.25)", color: "rgba(255,255,255,0.6)" }}>
            נשים
          </button>
          <button type="button"
            onClick={() => setFilterEnabled(false)}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
            style={!filterEnabled
              ? { background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff" }
              : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.4)" }}>
            הכל
          </button>
        </div>

        {/* Add button */}
        <Button
          onClick={openCreate}
          className="w-full h-11 font-bold rounded-2xl text-sm"
          style={{ background: "linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)", color: "#1E1E1E" }}
        >
          <Plus className="w-4 h-4 ml-1" />
          שירות חדש
        </Button>
      </div>

      {/* Services list */}
      <div className="space-y-3" dir="rtl">
        {filteredServices.map((service) => (
          <div key={service.id} className="rounded-2xl overflow-hidden relative"
            style={{ border: "1px solid rgba(222,198,167,0.18)" }}>
            {/* Background image */}
            {service.background_image_url && (
              <div className="absolute inset-0 z-0">
                <img src={service.background_image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "rgba(20,20,20,0.72)" }} />
              </div>
            )}
            <div className="relative z-10 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl shrink-0"
                    style={{ color: "#DEC6A7", background: "rgba(222,198,167,0.1)" }}
                    onClick={() => openEdit(service)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl shrink-0"
                    style={{ color: "#fca5a5", background: "rgba(239,68,68,0.1)" }}
                    onClick={() => { if (confirm("למחוק את השירות?")) deleteMutation.mutate(service.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 text-right">
                  <p className="font-bold text-base" style={{ color: "#DEC6A7" }}>{service.name}</p>
                  {service.description && (
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "rgba(255,255,255,0.5)" }}>{service.description}</p>
                  )}
                  <div className="flex items-center justify-end gap-3 mt-2">
                    <span className="text-sm font-bold text-white">{service.price} ₪</span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                      <Clock className="w-3 h-3" />{service.duration_minutes} דק'
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={service.gender === "female"
                        ? { background: "rgba(232,160,192,0.2)", color: "#e8a0c0" }
                        : { background: "rgba(222,198,167,0.15)", color: "#DEC6A7" }}>
                      {service.gender === "female" ? "נשים" : "גברים"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredServices.length === 0 && (
          <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.35)" }}>
            <Scissors className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>אין שירותים עדיין</p>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="w-[92vw] max-w-sm rounded-3xl max-h-[90vh] overflow-y-auto"
          style={{ background: "#1E1E1E", border: "1px solid rgba(222,198,167,0.3)" }}>
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold" style={{ color: "#DEC6A7" }}>
              {editingService ? "עריכת שירות" : "שירות חדש"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pb-2" dir="rtl">
            {/* Name */}
            <div>
              <Label className="block mb-1.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>שם השירות *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="למשל: תספורת גברים"
                className="h-11 rounded-2xl text-right text-white text-base"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(222,198,167,0.25)" }} />
            </div>

            {/* Price + Duration */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="block mb-1.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>מחיר (₪) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="80"
                  className="h-11 rounded-2xl text-right text-white"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(222,198,167,0.25)" }} />
              </div>
              <div className="flex-1">
                <Label className="block mb-1.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>משך (דק') *</Label>
                <Input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                  placeholder="30"
                  className="h-11 rounded-2xl text-right text-white"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(222,198,167,0.25)" }} />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="block mb-1.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>תיאור (אופציונלי)</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="תיאור קצר של השירות"
                className="h-11 rounded-2xl text-right text-white"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(222,198,167,0.25)" }} />
            </div>

            {/* Gender */}
            <div>
              <Label className="block mb-1.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>מגדר</Label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, gender: "male" }))}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
                  style={form.gender === "male"
                    ? { background: "linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)", color: "#1E1E1E" }
                    : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(222,198,167,0.25)", color: "rgba(255,255,255,0.6)" }}>
                  גברים
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, gender: "female" }))}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
                  style={form.gender === "female"
                    ? { background: "linear-gradient(135deg, #e8a0c0 0%, #c970a0 100%)", color: "#1E1E1E" }
                    : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(222,198,167,0.25)", color: "rgba(255,255,255,0.6)" }}>
                  נשים
                </button>
              </div>
            </div>

            {/* Background image */}
            <div>
              <Label className="block mb-1.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>תמונת רקע לכרטיס</Label>
              {form.background_image_url && (
                <div className="w-full h-28 rounded-2xl overflow-hidden mb-2 relative">
                  <img src={form.background_image_url} alt="" className="w-full h-full object-cover" />
                  <button type="button"
                    className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(239,68,68,0.8)" }}
                    onClick={() => setForm(f => ({ ...f, background_image_url: "" }))}>
                    <span className="text-white text-xs font-bold">✕</span>
                  </button>
                </div>
              )}
              <label htmlFor="service-bg-image" className="cursor-pointer block">
                <div className="w-full py-4 rounded-2xl font-bold text-sm text-center transition-all active:scale-95"
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px dashed ${form.background_image_url ? "rgba(222,198,167,0.6)" : "rgba(222,198,167,0.25)"}`, color: form.background_image_url ? "#DEC6A7" : "rgba(255,255,255,0.5)" }}>
                  <Upload className="w-4 h-4 inline ml-2" />
                  {uploading ? "מעלה..." : form.background_image_url ? "החלף תמונה" : "בחר תמונת רקע"}
                </div>
                <input id="service-bg-image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!form.name || !form.price || !form.duration_minutes || isSaving}
              className="w-full h-12 font-bold rounded-2xl text-base disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #DEC6A7 0%, #B8A87A 100%)", color: "#1E1E1E" }}>
              {isSaving ? "שומר..." : editingService ? "עדכן שירות" : "צור שירות"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}