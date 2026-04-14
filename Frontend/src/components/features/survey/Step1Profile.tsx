"use client";

import { DogSex, SurveyData } from "./types";
import { cn } from "@/lib/utils";
import { Calendar, Dog, Camera, X } from "lucide-react";
import { useState, useMemo } from "react";
import breedsData from "@/data/breeds.json";
import { matchSearch } from "@/lib/hangulUtils";
import { supabase } from "@/lib/supabase";

// Extended interface for JSON data
interface BreedEntry {
    id: string;
    ko: string;
    en: string;
}

interface Props {
    data: SurveyData;
    updateData: (newData: Partial<SurveyData>) => void;
}

export function Step1Profile({ data, updateData }: Props) {
    const [showBreeds, setShowBreeds] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(data.profileImageUrl || null);
    const [isUploading, setIsUploading] = useState(false);

    const filteredBreeds = useMemo(() => {
        if (!data.breed) return (breedsData as BreedEntry[]).slice(0, 50); // Show first 50 if empty
        return (breedsData as BreedEntry[])
            .filter(b => matchSearch(b.ko, data.breed) || matchSearch(b.en, data.breed))
            .slice(0, 50); // Limit results for performance
    }, [data.breed]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('파일 크기는 5MB 이하여야 합니다.');
            return;
        }

        setImageFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Supabase Storage
        await uploadImage(file);
    };

    const uploadImage = async (file: File) => {
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { data: uploadData, error } = await supabase.storage
                .from('dog-profiles')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('dog-profiles')
                .getPublicUrl(fileName);

            updateData({ profileImageUrl: publicUrl });
        } catch (error) {
            console.error('Image upload error:', error);
            alert('이미지 업로드에 실패했습니다. 나중에 다시 시도해주세요.');
            setImageFile(null);
            setImagePreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        updateData({ profileImageUrl: '' });
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">누구를 위한 교육인가요?</h2>
                <p className="text-gray-500">맞춤형 교육 과정을 위해 반려견의 기본 정보를 알려주세요.</p>
            </div>

            {/* Profile Photo Upload */}
            <div className="flex justify-center mb-6">
                <div className="space-y-2 text-center">
                    <label className="text-sm font-bold text-gray-700 block mb-3">프로필 사진 (선택)</label>

                    {imagePreview ? (
                        <div className="relative inline-block">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-brand-lime/20 shadow-lg">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleRemoveImage}
                                disabled={isUploading}
                                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    ) : (
                        <label className="inline-block w-32 h-32 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-lime hover:bg-brand-lime/5 transition-all">
                            <Camera className="w-10 h-10 text-gray-400 mb-2" />
                            <span className="text-xs text-gray-500 font-medium px-2">사진 추가</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    )}

                    {isUploading && (
                        <p className="text-xs text-brand-lime font-medium animate-pulse">
                            업로드 중...
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Input */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">이름이 무엇인가요?</label>
                    <input
                        type="text"
                        value={data.dogName}
                        onChange={(e) => updateData({ dogName: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/20 outline-none transition-all"
                        placeholder="예: 머루"
                    />
                </div>

                {/* Breed Input */}
                <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-gray-700">견종을 알려주세요</label>
                    <div className="relative">
                        <Dog className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={data.breed}
                            onChange={(e) => {
                                updateData({ breed: e.target.value });
                                setShowBreeds(true);
                            }}
                            onFocus={() => setShowBreeds(true)}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/20 outline-none transition-all"
                            placeholder="견종 검색 또는 입력..."
                        />
                    </div>

                    {showBreeds && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowBreeds(false)}
                            />
                            <div className="absolute z-20 w-full mt-2 max-h-60 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-xl py-2 animate-in fade-in zoom-in duration-200">
                                {filteredBreeds.length > 0 ? (
                                    filteredBreeds.map((b) => (
                                        <button
                                            key={b.id}
                                            onClick={() => {
                                                // Default to Korean, toggleable in the future
                                                const showEnglish = false;
                                                updateData({ breed: showEnglish ? b.en : b.ko });
                                                setShowBreeds(false);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-brand-lime/5 transition-colors flex items-center justify-between group"
                                        >
                                            <span className="text-slate-800 group-hover:text-brand-lime font-medium">
                                                {/* English/Korean toggle placeholder */}
                                                {(false as boolean) ? b.en : b.ko}
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                        검색 결과가 없습니다. <br />
                                        <span className="text-xs text-gray-400">직접 입력하셔도 됩니다.</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Birth Date */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">생년월일</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="date"
                            value={data.birthDate}
                            onChange={(e) => updateData({ birthDate: e.target.value })}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/20 outline-none transition-all placeholder-gray-400 text-slate-800"
                        />
                    </div>
                </div>

                {/* Adoption Date */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">입양일 (가족이 된 날)</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="date"
                            value={data.adoptionDate}
                            onChange={(e) => updateData({ adoptionDate: e.target.value })}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/20 outline-none transition-all placeholder-gray-400 text-slate-800"
                        />
                    </div>
                </div>
            </div>

            {/* Weight */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">몸무게 (kg)</label>
                <input
                    type="number"
                    step="0.1"
                    value={data.weight}
                    onChange={(e) => updateData({ weight: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/20 outline-none transition-all"
                    placeholder="예: 5.2"
                />
            </div>

            {/* Sex & Neutered Selection Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sex Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">성별</label>
                    <div className="grid grid-cols-2 gap-3">
                        <SexButton
                            label="수컷"
                            selected={data.sex?.startsWith('MALE') || false}
                            onClick={() => {
                                const isNeutered = data.sex?.includes('NEUTERED');
                                updateData({ sex: isNeutered ? 'MALE_NEUTERED' : 'MALE' });
                            }}
                        />
                        <SexButton
                            label="암컷"
                            selected={data.sex?.startsWith('FEMALE') || false}
                            onClick={() => {
                                const isNeutered = data.sex?.includes('NEUTERED');
                                updateData({ sex: isNeutered ? 'FEMALE_NEUTERED' : 'FEMALE' });
                            }}
                        />
                    </div>
                </div>

                {/* Neutered Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">중성화 여부</label>
                    <div className="grid grid-cols-2 gap-3">
                        <SexButton
                            label="했어요"
                            selected={data.sex?.includes('NEUTERED') || false}
                            onClick={() => {
                                if (data.sex?.startsWith('MALE')) updateData({ sex: 'MALE_NEUTERED' });
                                if (data.sex?.startsWith('FEMALE')) updateData({ sex: 'FEMALE_NEUTERED' });
                            }}
                            disabled={!data.sex} // Disable if no sex selected
                        />
                        <SexButton
                            label="안 했어요"
                            selected={!!data.sex && !data.sex.includes('NEUTERED')}
                            onClick={() => {
                                if (data.sex?.startsWith('MALE')) updateData({ sex: 'MALE' });
                                if (data.sex?.startsWith('FEMALE')) updateData({ sex: 'FEMALE' });
                            }}
                            disabled={!data.sex}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function SexButton({ label, subLabel, selected, onClick, disabled }: { label: string, subLabel?: string, selected: boolean, onClick: () => void, disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "p-3 rounded-xl border transition-all text-center h-14 flex flex-col items-center justify-center",
                selected
                    ? "border-brand-lime bg-brand-lime/5 text-brand-lime font-bold ring-1 ring-brand-lime"
                    : "border-gray-200 hover:border-brand-lime/50 text-gray-600",
                disabled && "opacity-50 cursor-not-allowed hover:border-gray-200"
            )}
        >
            <div className="text-sm">{label}</div>
            {subLabel && <div className="text-xs text-gray-400 font-normal">{subLabel}</div>}
        </button>
    );
}
