'use client'

import {useState, useEffect} from 'react'
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {DateRangePicker} from "@/components/date-range-picker"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Check, X} from "lucide-react"
import {cn} from "@/lib/utils"
import api, {SearchParams, Person, Image, SearchResults} from '@/lib/api'
import FullImageView from '@/components/full-image-view'
import {DateRange} from "react-day-picker"
import {Switch} from "@/components/ui/switch"
import {Label} from "@/components/ui/label"
import {useRouter} from 'next/navigation'

export default function PhotoManagementSystem() {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        query: '',
        page: 1,
        per_page: 20
    })
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [people, setPeople] = useState<Person[]>([])
    const [selectedPeople, setSelectedPeople] = useState<Person[]>([])
    const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
    const [selectedImage, setSelectedImage] = useState<Image | null>(null)
    const [sortByDate, setSortByDate] = useState(false)
    const [datasetFolder, setDatasetFolder] = useState('')  // New state for dataset folder path
    const router = useRouter()

    useEffect(() => {
        api.getPeople().then(setPeople)
    }, [])

    const handleSearch = async (page = 1) => {
        console.log("Searching with params", searchParams)
        console.log("Date range", dateRange?.from?.toISOString(), dateRange?.to?.toISOString())
        const results = await api.search({
            ...searchParams,
            start_date: dateRange?.from?.toISOString(),
            end_date: dateRange?.to?.toISOString(),
            people_ids: selectedPeople.map(p => p.people_id),
            page,
            per_page: 20
        })
        setSearchResults(results)
    }

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => ({...prev, page: newPage}))
        handleSearch(newPage)
    }

    const handlePersonSelect = (personId: string) => {
        const person = people.find(p => p.people_id.toString() === personId)
        if (person) {
            setSelectedPeople(prev =>
                prev.some(p => p.people_id === person.people_id)
                    ? prev.filter(p => p.people_id !== person.people_id)
                    : [...prev, person]
            )
        }
    }

    // New handler for dataset ingestion
    const handleLoadDataset = async () => {
        if (!datasetFolder) return alert("Please enter a folder path.")
        try {
            const response = await api.loadDataset({folder_path: datasetFolder})
            alert(`Dataset loaded successfully. Processed ${response.total_processed} images.`)
        } catch (error) {
            console.error(error)
            alert('Failed to load dataset.')
        }
    }

    const sortedResults = sortByDate && searchResults
        ? {
            ...searchResults,
            results: [...searchResults.results].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }
        : searchResults

    return (
        <div className="min-h-screen bg-orange-50 font-sans">
            <div className="container mx-auto p-8">
                <h1 className="text-4xl font-bold mb-8 text-orange-800">Photo Management System</h1>
                <Button onClick={() => router.push('/people-management')} className="mb-4">Manage People</Button>

                {/* Search Section */}
                <div className="space-y-4">
                    <Input
                        placeholder="Search photos..."
                        value={searchParams.query}
                        onChange={(e) => setSearchParams(prev => ({...prev, query: e.target.value}))}
                        className="bg-white"
                    />
                    <div className="flex space-x-4">
                        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} className="w-[300px]"/>
                        <Select onValueChange={handlePersonSelect}>
                            <SelectTrigger className="w-[300px]">
                                <SelectValue placeholder="Select people..."/>
                            </SelectTrigger>
                            <SelectContent>
                                {people.map((person) => (
                                    <SelectItem key={person.people_id} value={person.people_id.toString()}>
                                        <div className="flex items-center">
                                            <Avatar className="h-12 w-12 mr-3">
                                                <AvatarImage src={api.getPersonFaceUrl(person.people_id)}
                                                             alt={person.name || `Person ${person.people_id}`}/>
                                                <AvatarFallback>{(person.name && person.name.charAt(0)) || person.people_id}</AvatarFallback>
                                            </Avatar>
                                            <span
                                                className="flex-grow">{person.name || `Person ${person.people_id}`}</span>
                                            <Check
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    selectedPeople.some(p => p.people_id === person.people_id) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={() => handleSearch()}
                                className="bg-orange-600 hover:bg-orange-700 text-white">Search</Button>
                    </div>
                    {selectedPeople.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedPeople.map(person => (
                                <div key={person.people_id}
                                     className="flex items-center bg-orange-200 rounded-full px-3 py-1">
                                    <Avatar className="h-8 w-8 mr-2">
                                        <AvatarImage src={api.getPersonFaceUrl(person.people_id)}
                                                     alt={person.name || `Person ${person.people_id}`}/>
                                        <AvatarFallback>{(person.name && person.name.charAt(0)) || person.people_id}</AvatarFallback>
                                    </Avatar>
                                    <span>{person.name || `Person ${person.people_id}`}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-2 h-5 w-5 p-0"
                                        onClick={() => handlePersonSelect(person.people_id.toString())}
                                    >
                                        <X className="h-3 w-3"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        <Switch id="sort-by-date" checked={sortByDate} onCheckedChange={setSortByDate}/>
                        <Label htmlFor="sort-by-date">Sort by date (newest first)</Label>
                    </div>
                </div>

                {sortedResults && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4 text-orange-800">Search Results</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {sortedResults.results.map((image: Image) => (
                                <Card key={image.image_id} className="overflow-hidden cursor-pointer"
                                      onClick={() => setSelectedImage(image)}>
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
                                                        <Avatar key={peopleId} className="h-10 w-10">
                                                            <AvatarImage src={api.getPersonFaceUrl(peopleId)}
                                                                         alt={person.name || `Person ${peopleId}`}/>
                                                            <AvatarFallback>{(person.name && person.name.charAt(0)) || peopleId}</AvatarFallback>
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
                                onClick={() => handlePageChange(sortedResults.page - 1)}
                                disabled={sortedResults.page === 1}
                            >
                                Previous
                            </Button>
                            <span
                                className="py-2">Page {sortedResults.page} of {Math.ceil(sortedResults.total / sortedResults.per_page)}</span>
                            <Button
                                onClick={() => handlePageChange(sortedResults.page + 1)}
                                disabled={sortedResults.page * sortedResults.per_page >= sortedResults.total}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}

                <br></br>
                {/* New Dataset Ingestion Section */}
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4 text-orange-800">Load Dataset</h2>
                    <p className="text-gray-600 mb-4">Load a new dataset of images from a folder on your computer. This
                        is a one-time action - unfortunately, we don&apos;t have a feature to add new photos. You&apos;d
                        need to delete the <code>photos</code> folder under <code>data</code>.</p>
                    <p className="text-gray-600 mb-4"> It&apos;ll take a
                        while to load - look at the backend logs in Docker for the progress bar.</p>
                    <div className="flex space-x-4 items-center">
                        <Input
                            placeholder="Enter absolute folder path"
                            value={datasetFolder}
                            onChange={(e) => setDatasetFolder(e.target.value)}
                            className="w-full"
                        />
                        <Button onClick={handleLoadDataset} className="bg-blue-600 hover:bg-blue-700 text-white">Load
                            Dataset</Button>
                    </div>
                </div>
            </div>
            {selectedImage && (
                <FullImageView
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                    showDate={true}
                />
            )}
        </div>
    )
}
