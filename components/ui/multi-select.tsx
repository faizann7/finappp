'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MultiSelectProps {
    label: string;
    options: { id: string; name: string }[];
    selected: string[];
    onChange: (values: string[]) => void;
}

export function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
    const [open, setOpen] = useState(false);

    const toggleOption = (id: string) => {
        if (selected.includes(id)) {
            onChange(selected.filter(item => item !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <Select open={open} onOpenChange={setOpen}>
                <SelectTrigger>
                    <SelectValue placeholder="Select options" />
                </SelectTrigger>
                <SelectContent>
                    {options.map(option => (
                        <SelectItem key={option.id} value={option.id} onClick={() => toggleOption(option.id)}>
                            <span className={selected.includes(option.id) ? "font-bold" : ""}>
                                {option.name}
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
} 