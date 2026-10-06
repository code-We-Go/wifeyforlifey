"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Building2, 
  Store, 
  DollarSign, 
  Globe, 
  Image as ImageIcon, 
  FileText, 
  PhoneCall, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  X
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { thirdFont } from "@/fonts";
import { bgRedButton } from "@/app/constants";

interface SubCategory {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
  subcategories: SubCategory[];
}

export default function JoinVendorPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryID, setSelectedCategoryID] = useState<string>("");
  const [selectedSubCategoryIDs, setSelectedSubCategoryIDs] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Link & Image arrays state
  const [links, setLinks] = useState<string[]>([""]);
  const [coverImage, setCoverImage] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    fromPrice: "",
    toPrice: "",
    package: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/categories?type=wedding-planning")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error("Failed to load wedding planning categories:", err))
      .finally(() => setLoadingCategories(false));
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
    setSelectedCategoryID(catId);
  };

  const toggleSubCategory = (subId: string) => {
    setSelectedSubCategoryIDs((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  const removeSubCategory = (subId: string) => {
    setSelectedSubCategoryIDs((prev) => prev.filter((id) => id !== subId));
  };

  const availableSubcategories =
    categories.find((c) => c._id === selectedCategoryID)?.subcategories || [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ─── Multiple Links Management ──────────────────────────────────────────────
  const handleLinkChange = (index: number, value: string) => {
    setLinks((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addLinkField = () => {
    setLinks((prev) => [...prev, ""]);
  };

  const removeLinkField = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Gallery Images Management ──────────────────────────────────────────────
  const handleAddManualImage = () => {
    if (manualImageUrl.trim()) {
      setImages((prev) => [...prev, manualImageUrl.trim()]);
      setManualImageUrl("");
    }
  };

  const removeGalleryImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Form Submission ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your business or vendor name.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const validLinks = links.map((l) => l.trim()).filter(Boolean);
    const validImages = images.map((img) => img.trim()).filter(Boolean);

    const payload = {
      ...formData,
      subCategoryID: selectedSubCategoryIDs,
      link: validLinks,
      coverImage: coverImage.trim(),
      images: validImages,
    };

    try {
      const response = await fetch("/api/wedding-planning-vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSubmitted(true);
        toast({
          title: "Request Submitted! 🎉",
          description: "Thank you! Your vendor application is pending review.",
          variant: "added",
        });
      } else {
        toast({
          title: "Submission Error",
          description: result.error || "Failed to submit request. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Vendor request error:", error);
      toast({
        title: "Network Error",
        description: "Something went wrong. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      name: "",
      fromPrice: "",
      toPrice: "",
      package: "",
      notes: "",
    });
    setSelectedSubCategoryIDs([]);
    setLinks([""]);
    setCoverImage("");
    setImages([]);
    setManualImageUrl("");
    setSelectedCategoryID("");
  };

  return (
    <div className="min-h-screen bg-creamey text-lovely py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-lovely/10 text-lovely px-4 py-1.5 rounded-full text-sm font-medium border border-lovely/20">
            <Sparkles className="w-4 h-4 text-lovely" />
            <span>Join Wifey for Lifey Vendor Network</span>
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-bold tracking-tight text-lovely ${thirdFont.className}`}>
            Request to Add Your Vendor Service
          </h1>
          
          <p className="text-lovely/80 max-w-2xl mx-auto text-base sm:text-lg">
            Are you a wedding photographer, planner, venue, florist, makeup artist, or vendor? 
            Partner with us to showcase your services directly to hundreds of brides-to-be!
          </p>
        </div>

        {/* Form Card or Success Screen */}
        <Card className="shadow-lg border-lovely/80 border-2 bg-creamey overflow-hidden">
          <CardHeader className="bg-lovely/5 border-b border-lovely/10 p-6">
            <CardTitle className={`text-2xl text-lovely ${thirdFont.className}`}>
              {isSubmitted ? "Application Received!" : "Vendor Registration Form"}
            </CardTitle>
            <CardDescription className="text-lovely/80">
              {isSubmitted
                ? "Our team is reviewing your information and will contact you shortly."
                : "Fill out your details below. Once approved by our team, your listing will go live."}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {isSubmitted ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-16 h-16 bg-lovely/10 text-lovely rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className={`text-2xl font-bold text-lovely ${thirdFont.className}`}>Thank You for Applying!</h3>
                  <p className="text-lovely/80 max-w-md mx-auto">
                    Your request has been successfully recorded. We will review your service catalog and publish your profile upon verification.
                  </p>
                </div>
                <div className="pt-4 flex justify-center gap-4">
                  <Button asChild variant="outline" className="border-lovely text-lovely">
                    <Link href="/">Return to Home</Link>
                  </Button>
                  <Button onClick={resetForm} className={bgRedButton}>
                    Submit Another Vendor
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Vendor Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-medium text-sm flex items-center gap-1.5 text-lovely">
                      <Store className="w-4 h-4 text-lovely" />
                      Business / Vendor Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      className="bg-creamey border-pinkey text-lovely placeholder:text-lovely/70"
                      id="name"
                      name="name"
                      placeholder="e.g. Royal Photography & Films"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Main Category selection */}
                  <div className="space-y-2">
                    <Label htmlFor="categoryID" className="font-medium text-sm flex items-center gap-1.5 text-lovely">
                      <Building2 className="w-4 h-4 text-lovely" />
                      Main Category
                    </Label>
                    <select
                      id="categoryID"
                      value={selectedCategoryID}
                      onChange={handleCategoryChange}
                      className="flex h-10 w-full rounded-md border border-pinkey bg-creamey text-lovely px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select a main category...</option>
                      {loadingCategories ? (
                        <option disabled>Loading categories...</option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Multi-Subcategory selection */}
                  <div className="space-y-3 md:col-span-2">
                    <Label className="font-medium text-sm flex items-center gap-1.5 text-lovely">
                      <Store className="w-4 h-4 text-lovely" />
                      Service Subcategories (Select one or more)
                    </Label>

                    {!selectedCategoryID ? (
                      <p className="text-xs text-lovely/60 italic bg-lovely/5 p-3 rounded-md border border-pinkey/50">
                        Select a main category above to display available subcategories.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-lovely/80 font-medium">
                          Click to select/deselect subcategories for this category:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {availableSubcategories.map((sub) => {
                            const isSelected = selectedSubCategoryIDs.includes(sub._id);
                            return (
                              <button
                                type="button"
                                key={sub._id}
                                onClick={() => toggleSubCategory(sub._id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                                  isSelected
                                    ? "bg-lovely text-creamey shadow-sm scale-105"
                                    : "bg-creamey border border-pinkey text-lovely hover:bg-lovely/10"
                                }`}
                              >
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-creamey" />}
                                {sub.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Display all selected subcategories across categories */}
                    {selectedSubCategoryIDs.length > 0 && (
                      <div className="pt-2 border-t border-lovely/10 space-y-1.5">
                        <p className="text-xs font-semibold text-lovely">
                          Selected Subcategories ({selectedSubCategoryIDs.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedSubCategoryIDs.map((subId) => {
                            const subObj = categories
                              .flatMap((c) => c.subcategories)
                              .find((s) => s._id === subId);
                            return (
                              <span
                                key={subId}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-lovely/15 text-lovely border border-lovely/30 font-medium"
                              >
                                {subObj?.name || "Subcategory"}
                                <button
                                  type="button"
                                  onClick={() => removeSubCategory(subId)}
                                  className="hover:text-red-600 transition"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* From Price */}
                  <div className="space-y-2">
                    <Label htmlFor="fromPrice" className="font-medium text-sm flex items-center gap-1.5 text-lovely">
                      <DollarSign className="w-4 h-4 text-lovely" />
                      Starting Price (EGP)
                    </Label>
                    <Input
                      className="bg-creamey border-pinkey text-lovely placeholder:text-lovely/70"
                      id="fromPrice"
                      name="fromPrice"
                      type="number"
                      placeholder="e.g. 5000"
                      value={formData.fromPrice}
                      onChange={handleChange}
                    />
                  </div>

                  {/* To Price */}
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="toPrice" className="font-medium text-sm flex items-center gap-1.5 text-lovely">
                      <DollarSign className="w-4 h-4 text-lovely" />
                      Maximum Price (EGP)
                    </Label>
                    <Input
                      className="bg-creamey border-pinkey text-lovely placeholder:text-lovely/70"
                      id="toPrice"
                      name="toPrice"
                      type="number"
                      placeholder="e.g. 25000"
                      value={formData.toPrice}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* ─── Multiple Portfolio & Social Links ────────────────────── */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-sm flex items-center gap-1.5 text-lovely">
                      <Globe className="w-4 h-4 text-lovely" />
                      Website, Instagram & Social Links
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLinkField}
                      className="text-xs border-pinkey text-lovely hover:bg-lovely/10 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Link
                    </Button>
                  </div>

                  {links.map((linkVal, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        className="bg-creamey border-pinkey text-lovely placeholder:text-lovely/70 flex-1"
                        placeholder={
                          index === 0
                            ? "https://instagram.com/yourbusiness"
                            : index === 1
                            ? "https://facebook.com/yourbusiness"
                            : "https://yourwebsite.com"
                        }
                        value={linkVal}
                        onChange={(e) => handleLinkChange(index, e.target.value)}
                      />
                      {links.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLinkField(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* ─── Cover Image (Cloudinary + URL) ────────────────────────── */}
                <div className="space-y-3 pt-2">
                  <Label className="font-medium text-sm flex items-center gap-1.5 text-lovely">
                    <ImageIcon className="w-4 h-4 text-lovely" />
                    Cover Image
                  </Label>

                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <CldUploadWidget
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"}
                      onSuccess={(result: any) => {
                        if (result.info && typeof result.info !== "string" && result.info.secure_url) {
                          setCoverImage(result.info.secure_url);
                        }
                      }}
                    >
                      {({ open }) => (
                        <Button
                          type="button"
                          onClick={() => open()}
                          variant="outline"
                          className="border-pinkey text-lovely hover:bg-lovely/10 flex items-center gap-2"
                        >
                          <UploadCloud className="w-4 h-4" />
                          Upload Cover
                        </Button>
                      )}
                    </CldUploadWidget>


                  </div>

                  {coverImage && (
                    <div className="relative w-full max-w-xs h-40 rounded-lg overflow-hidden border-2 border-pinkey mt-2">
                      <Image
                        src={coverImage}
                        alt="Cover Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setCoverImage("")}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* ─── Gallery / Portfolio Images (Cloudinary + URL) ─────────── */}
                <div className="space-y-3 pt-2">
                  <Label className="font-medium text-sm flex items-center gap-1.5 text-lovely">
                    <ImageIcon className="w-4 h-4 text-lovely" />
                    Gallery & Portfolio Images (Multiple)
                  </Label>

                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <CldUploadWidget
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"}
                      options={{ multiple: true }}
                      onSuccess={(result: any) => {
                        if (result.info && typeof result.info !== "string" && result.info.secure_url) {
                          setImages((prev) => [...prev, result.info.secure_url]);
                        }
                      }}
                    >
                      {({ open }) => (
                        <Button
                          type="button"
                          onClick={() => open()}
                          variant="outline"
                          className="border-pinkey text-lovely hover:bg-lovely/10 flex items-center gap-2"
                        >
                          <UploadCloud className="w-4 h-4" />
                          Upload Gallery Images
                        </Button>
                      )}
                    </CldUploadWidget>


                  </div>

                  {/* Gallery Grid Preview */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {images.map((imgUrl, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-pinkey group">
                          <Image
                            src={imgUrl}
                            alt={`Gallery image ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Packages / Details */}
                <div className="space-y-2 pt-2">
                  <Label htmlFor="package" className="font-medium text-sm flex items-center gap-1.5 text-lovely">
                    <FileText className="w-4 h-4 text-lovely" />
                    Packages & Offerings Summary
                  </Label>
                  <Textarea
                    className="bg-creamey border-pinkey text-lovely placeholder:text-lovely/70"
                    id="package"
                    name="package"
                    rows={3}
                    placeholder="Describe what is included in your packages (e.g. 8-hour photography session, printed album, drone footage)..."
                    value={formData.package}
                    onChange={handleChange}
                  />
                </div>

                {/* Contact & Extra Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="font-medium text-sm flex items-center gap-1.5 text-lovely">
                    <PhoneCall className="w-4 h-4 text-lovely" />
                    Contact Info & Additional Notes
                  </Label>
                  <Textarea
                    className="bg-creamey border-pinkey text-lovely placeholder:text-lovely/70"
                    id="notes"
                    name="notes"
                    rows={3}
                    placeholder="Provide your contact phone number, email address, or any special requests for our admin team..."
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`${bgRedButton} w-full sm:w-auto px-8 py-6 text-base font-medium`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        Submit Vendor Request
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
