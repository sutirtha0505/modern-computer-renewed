"use client";
import SearchResult from '@/components/SearchResult';
import { UseSupabase } from '@/lib/hooks/UseSupabase';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';

const SearchResultPage = () => {
    const { query } = useParams();
    const { filterData, getFilterData } = UseSupabase();

    useEffect(() => {
        if (query) {
            getFilterData(query.toString());
        }
    }, [query, getFilterData]);

    return (
        <div className={`${filterData.length < 4 ? 'h-screen' : 'h-full'}`}>
            <SearchResult filterData={filterData} />
        </div>
    );
};

export default SearchResultPage;
