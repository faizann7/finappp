"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DropdownWithAddItemProps {
    items: string[]
    value: string
    onItemSelect: (item: string) => void
    onItemAdd: (item: string) => void
}

export function DropdownWithAddItem({
    items,
    value,
    onItemSelect,
    onItemAdd
}: DropdownWithAddItemProps) {
    const [open, setOpen] = React.useState(false)
    const [newItem, setNewItem] = React.useState("")

    const handleAddItem = () => {
        if (newItem.trim() !== "") {
            onItemAdd(newItem.trim())
            setNewItem("")
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value || "Select item..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Search item..." />
                    <CommandList>
                        <CommandEmpty>No item found.</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item}
                                    onSelect={() => {
                                        onItemSelect(item)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup>
                            <div className="flex items-center px-2 py-1.5">
                                <Input
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    placeholder="Add new item"
                                    className="flex-grow mr-2"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleAddItem}
                                    disabled={newItem.trim() === ""}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
} 