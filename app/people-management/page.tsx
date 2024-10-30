'use client'

import {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import api, {Person} from '@/lib/api'
import {toast} from "@/hooks/use-toast";

export default function PeopleManagement() {
    const [people, setPeople] = useState<Person[]>([])
    const [editingPerson, setEditingPerson] = useState<Person | null>(null)
    const [newName, setNewName] = useState('')
    const [mergeSource, setMergeSource] = useState<Person | null>(null)
    const [mergeTarget, setMergeTarget] = useState<Person | null>(null)
    const router = useRouter()

    useEffect(() => {
        fetchPeople()
    }, [])

    const fetchPeople = async () => {
        const fetchedPeople = await api.getPeople()
        setPeople(fetchedPeople)
    }

    const handleEditPerson = (person: Person) => {
        setEditingPerson(person)
        setNewName(person.name)
    }

    const handleUpdatePerson = async () => {
        if (editingPerson) {
            try {
                const updatedPerson = await api.updatePerson(editingPerson.people_id, newName)
                setPeople(people.map(p =>
                    p.people_id === updatedPerson.people_id
                        ? {...updatedPerson, photo_count: p.photo_count}
                        : p
                ))
                setEditingPerson(null)
                toast({
                    title: "Person updated",
                    description: `${updatedPerson.name} has been successfully updated.`,
                })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to update person. Please try again.",
                    variant: "destructive",
                })
            }
        }
    }


    const handleDeletePerson = async (personId: number) => {
        try {
            api.deletePerson(personId)
            setPeople(people.filter(p => p.people_id !== personId))
            toast({
                title: "Person deleted",
                description: "The person has been successfully deleted.",
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete person. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleMergePeople = async () => {
        if (mergeSource && mergeTarget) {
            try {
                const mergedPerson = await api.mergePeople(mergeSource.people_id, mergeTarget.people_id)
                setPeople(people.filter(p => p.people_id !== mergeSource.people_id && p.people_id !== mergeTarget.people_id).concat(mergedPerson))
                setMergeSource(null)
                setMergeTarget(null)
                toast({
                    title: "People merged",
                    description: `${mergeSource.name} and ${mergeTarget.name} have been successfully merged.`,
                })
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to merge people. Please try again.",
                    variant: "destructive",
                })
            }
        }
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold mb-8">People Management</h1>
            <Button onClick={() => router.push('/')} className="mb-4">Back to Dashboard</Button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {people.map(person => (
                    <Card key={person.people_id}>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={api.getPersonFaceUrl(person.people_id)} alt={person.name}/>
                                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{person.name}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Photos: {person.photo_count}</p>
                            <div className="mt-4 space-x-2">
                                <Button onClick={() => handleEditPerson(person)}>Edit</Button>
                                <Button variant="destructive"
                                        onClick={() => handleDeletePerson(person.people_id)}>Delete</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Dialog open={editingPerson !== null} onOpenChange={() => setEditingPerson(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Person</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <Button onClick={handleUpdatePerson}>Save Changes</Button>
                </DialogContent>
            </Dialog>
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Merge People</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Source Person</Label>
                            <select
                                className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                value={mergeSource?.people_id || ''}
                                onChange={(e) => setMergeSource(people.find(p => p.people_id === parseInt(e.target.value)) || null)}
                            >
                                <option value="">Select a person</option>
                                {people.map(person => (
                                    <option key={person.people_id} value={person.people_id}>{person.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Target Person</Label>
                            <select
                                className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                value={mergeTarget?.people_id || ''}
                                onChange={(e) => setMergeTarget(people.find(p => p.people_id === parseInt(e.target.value)) || null)}
                            >
                                <option value="">Select a person</option>
                                {people.map(person => (
                                    <option key={person.people_id} value={person.people_id}>{person.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <Button onClick={handleMergePeople} className="mt-4" disabled={!mergeSource || !mergeTarget}>Merge
                        People</Button>
                </CardContent>
            </Card>
        </div>
    )
}
