import { supabase } from './supabase'

export type Category = {
    id: string
    label: string
    sort_order: number
    }

export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

    if (error) {
    console.error('Error fetching categories:', error.message)
    return []
    }
    return data as Category[]
    }