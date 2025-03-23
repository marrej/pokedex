// Stanza required for the apollo next.js integration
"use client";
import styles from "./page.module.scss";
import { gql, useQuery } from '@apollo/client';
import {useState, useRef, useEffect} from 'react'
import {PokemonInfo} from '@/app/shared/types';
import { useAppSelector } from "@/lib/hooks";
import { useAppDispatch } from "@/lib/hooks";
import { Card, CardSkeleton } from "@/app/components/card";
import { ToastContainer } from "@/app/components/toast";
import { ErrorMessage, Message } from '@/app/components/message';
import { FilterToolbar } from '@/app/components/toolbar'
import { resetLimit, increaseLimit, LIMIT } from "@/lib/features/filters/filtersSlice";

export default function Home() {
  // Allows attaching toast to the outermost div
  const toastProps = useAppSelector((state) => state.toast.props);
  const toast = toastProps ? <ToastContainer {...toastProps} /> : null; 
  
  return (
    <div>
        {toast}
        <FilterToolbar />
        <div className={styles.scrollable_content}>
        <Content />
        </div>
    </div>
  );
}

interface PokemonListResponse {
  pokemons: {edges: PokemonInfo[]}
}

const GET_POKEMON_LIST = gql`
  query PokemonList($limit: Int!, $offset: Int!, $search: String, $type: String, $isFavorite: Boolean) { 
    pokemons(query: { limit: $limit, offset: $offset, search: $search, filter: {isFavorite: $isFavorite, type: $type} }) {
      edges {
        id,
        name,
        types,
        image,
        isFavorite,
        }
      }
  }
`;

function Content() {
  const dispatch = useAppDispatch();
  // Search filters
  const view = useAppSelector((state) => state.filters.view);
  const search = useAppSelector((state) => state.filters.search);
  const type = useAppSelector((state) => state.filters.type);
  const isFavorite = useAppSelector((state) => state.filters.isFavorite);
  const limit = useAppSelector((state) => state.filters.limit);

  // Signals whether we should refetch the data
  const shouldRefetch = useAppSelector((state) => state.filters.refetch);

  // Used for signalling loading when fetchMore is active
  const [isFetching, setIsFetching] = useState(false);


  // Used for the infinite scroll
  const observerTarget = useRef(null);

  const { loading, data, error, fetchMore, refetch } = useQuery<PokemonListResponse>(
    GET_POKEMON_LIST,
    {variables:{search, type, isFavorite, offset: 0, limit}}
  );

  // Refetch data when filters change
  if (shouldRefetch) {
    refetch({search, type, isFavorite, offset: 0, limit: LIMIT})
      .finally(() => {dispatch(resetLimit());})
  }

  const isLoading = loading || isFetching;
  // Infinite scroll listener - always attached to the last item
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Listen only if at last visible item while we didn't hit end of the list.
        if (!entries[0].isIntersecting || error || (data?.pokemons.edges.length ?? 0) < limit || isLoading) {return;}
        setIsFetching(true);
        fetchMore({variables:{search, type, isFavorite, limit: LIMIT, offset: data?.pokemons.edges.length ?? 0}})
          .then(() => {dispatch(increaseLimit());})
          .finally(() => {setIsFetching(false);})
      },
      { threshold: 1 }
    );
    const current = observerTarget.current
    if (current) {
      observer.observe(current);
    }
    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  });

  if (error) {
    return <ErrorMessage />;
  }

  const isList = view === 'list';

  // Generates loading skeletons
  const loadingPokemons = isLoading ? Array(8).fill(null).map((_, index) => (
    <CardSkeleton key={`skeleton${index}`} isDetail={false} isList={isList}/>
  )) : null;

  const retrievedPokemon = data?.pokemons.edges ?? [];
  const pokemonCards = [];
  let i = -1;
  // Preffered standard for of to reduce iterations compared to filter & map
  for (const p of retrievedPokemon) {
    i++;
    if (isFavorite && !p.isFavorite) {continue;}
    // Observe infinite scroll only on last item before all items are loaded, while not loading.
    const isInfiniteScrollObserver = limit <= retrievedPokemon.length && retrievedPokemon.length -1 === i && !isLoading;
    const infiniteScrollObs = ( isInfiniteScrollObserver ? <div key={"scroll"+p.id} ref={observerTarget}></div> : null);
    const card = (
      <div key={"card_wrapper"+p.id} className={styles.card_wrapper}>
        {infiniteScrollObs}
        <Card key={"pokemon"+p.id} pokemon={p} isList={isList}/>
      </div>
    );
    pokemonCards.push(card);
  }

  if (!isLoading && !pokemonCards.length) {
    return (<Message title="No pokemon found..." subtitle="Try a different filter combination" />);
  }

  return (
    <div className={isList ? styles.list : styles.grid}>
      {pokemonCards}
      {loadingPokemons}
    </div>
    );
}
