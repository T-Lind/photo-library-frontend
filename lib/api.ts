import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export interface SearchParams {
    query?: string;
    start_date?: string;
    end_date?: string;
    people_ids?: number[];
    page?: number;
    per_page?: number;
}

export interface Person {
    people_id: number;
    name: string;
    photo_count: number;
    face_image_url: string;
}

export interface Image {
    image_id: number;
    date: string;
    location: string;
    people_ids: number[];
    thumbnail_url: string;
}

export interface SearchParams {
    query?: string;
    start_date?: string;
    end_date?: string;
    people_ids?: number[];
    page?: number;
    per_page?: number;
}

export interface SearchResults {
    total: number;
    page: number;
    per_page: number;
    results: Image[];
}

const api = {
    search: async (params: SearchParams): Promise<SearchResults> => {
        const response = await axios.post(`${API_BASE_URL}/search`, params);
        return response.data;
    },

    getImageUrl: (imageId: number): string => {
        return `${API_BASE_URL}/images/${imageId}`;
    },

    getThumbnailUrl: (imageId: number, size: 'small' | 'medium' | 'large' = 'medium'): string => {
        return `${API_BASE_URL}/images/${imageId}/thumbnail?size=${size}`;
    },

    getPeople: async (): Promise<Person[]> => {
        const response = await axios.get(`${API_BASE_URL}/people`);
        console.log("Got people", response.data);
        return response.data;
    },

    getPerson: async (peopleId: number): Promise<Person> => {
        const response = await axios.get(`${API_BASE_URL}/people/${peopleId}`);
        return response.data;
    },

    updatePerson: async (peopleId: number, name: string): Promise<Person> => {
        const response = await axios.patch(`${API_BASE_URL}/people/${peopleId}`, {name});
        return response.data;
    },

    getPersonFaceUrl: (peopleId: number): string => {
        return `${API_BASE_URL}/people/${peopleId}/face`;
    },

    mergePeople: async (sourceId: number, targetId: number): Promise<Person> => {
        const response = await axios.post(`${API_BASE_URL}/people/merge`, {source_id: sourceId, target_id: targetId});
        return response.data;
    },
    deletePerson(personId: number) {
        axios.delete(`${API_BASE_URL}/people/${personId}`);
        return;
    }
};

export default api;
