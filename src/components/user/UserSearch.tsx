'use client';

import { Input } from '../ui/input';
import { Search } from 'lucide-react';

export function UserSearch({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
    return (
        <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
            />
        </div>
    );
}
