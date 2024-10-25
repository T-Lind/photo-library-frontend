'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DateRangePicker } from "@/components/date-range-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import api, { SearchParams, Person, Image, SearchResults } from '@/lib/api'
import FullImageView from '@/components/full-image-view'

export default function PhotoManagementSystem() {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        query: '',
        page: 1,
        per_page: 20
    })
    const [people, setPeople] = useState<Person[]>([])
    const [selectedPeople, setSelectedPeople] = useState<Person[]>([])
    const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
    const [open, setOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState<Image | null>(null)

    useEffect(() => {
        api.getPeople().then(setPeople)
    }, [])

    const handleSearch = async (page = 1) => {
        const results = await api.search({
            ...searchParams,
            people_ids: selectedPeople.map(p => p.people_id),
            page,
            per_page: 20
        })
        setSearchResults(results)
    }

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => ({ ...prev, page: newPage }))
        handleSearch(newPage)
    }

    return (
        <div className="min-h-screen bg-orange-50 font-sans">
            <div className="container mx-auto p-8">
                <h1 className="text-4xl font-bold mb-8 text-orange-800">Photo Management System</h1>
                <div className="space-y-4">
                    <Input
                        placeholder="Search photos..."
                        value={searchParams.query}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
                        className="bg-white"
                    />
                    <div className="flex space-x-4">
                        <DateRangePicker className="w-[300px]" />
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="justify-between bg-white"
                                >
                                    {selectedPeople.length > 0
                                        ? `${selectedPeople.length} people selected`
                                        : "Select people..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search people..." />
                                    <CommandEmpty>No person found.</CommandEmpty>
                                    <CommandGroup>
                                        {people.map((person) => (
                                            <CommandItem
                                                key={person.people_id}
                                                onSelect={() => {
                                                    setSelectedPeople(prev =>
                                                        prev.some(p => p.people_id === person.people_id)
                                                            ? prev.filter(p => p.people_id !== person.people_id)
                                                            : [...prev, person]
                                                    )
                                                    setOpen(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedPeople.some(p => p.people_id === person.people_id) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {person.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <Button onClick={() => handleSearch()} className="bg-orange-600 hover:bg-orange-700 text-white">Search</Button>
                    </div>
                </div>
                {searchResults && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4 text-orange-800">Search Results</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {searchResults.results.map((image: Image) => (
                                <Card key={image.image_id} className="overflow-hidden cursor-pointer" onClick={() => setSelectedImage(image)}>
                                    <CardContent className="p-0">
                                        <img
                                            src={api.getThumbnailUrl(image.image_id)}
                                            alt={`Photo from ${image.date}`}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="p-4">
                                            <p className="text-sm text-gray-500">{new Date(image.date).toLocaleDateString()}</p>
                                            <p className="text-sm text-gray-500">{image.location}</p>
                                            <div className="flex mt-2 space-x-1">
                                                {image.people_ids.map((peopleId) => {
                                                    const person = people.find(p => p.people_id === peopleId)
                                                    return person ? (
                                                        <Avatar key={peopleId}>
                                                            <AvatarImage src={api.getPersonFaceUrl(peopleId)} alt={person.name} />
                                                            <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    ) : null
                                                })}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-center space-x-2">
                            <Button
                                onClick={() => handlePageChange(searchResults.page - 1)}
                                disabled={searchResults.page === 1}
                            >
                                Previous
                            </Button>
                            <span className="py-2">Page {searchResults.page} of {Math.ceil(searchResults.total / searchResults.per_page)}</span>
                            <Button
                                onClick={() => handlePageChange(searchResults.page + 1)}
                                disabled={searchResults.page * searchResults.per_page >= searchResults.total}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            {selectedImage && (
                <FullImageView
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </div>
    )
}
