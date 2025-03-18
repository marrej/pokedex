// Stanza required for the apollo next.js integration
"use client";
import styles from "./page.module.scss";
import { gql, useQuery } from '@apollo/client';
import { ComboBox, TextInput, ContentSwitcher, Switch, Grid, Column} from "@carbon/react"
import {SwitchEventHandlersParams} from "@carbon/react/lib/components/ContentSwitcher/ContentSwitcher";
import {OnChangeData} from "@carbon/react/lib/components/ComboBox/ComboBox";
import { List as ListIcon, Grid as GridIcon} from '@carbon/icons-react';
import {useState, useRef, useEffect} from 'react'
import {PokemonInfo} from './shared/types';
import { Card, CardSkeleton } from "./components/card";


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

export default function Home() {
  const [view, setView] = useState<'list'|'grid'>('grid');
  const [isFavorite, setFavorite] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(8);
  const [search, setSearch] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [isFetching, setIsFetching] = useState(false);

  const observerTarget = useRef(null);

  const initVariables = {search, type, isFavorite, offset: 0, limit: 8};

  const { loading, data, error, fetchMore, refetch } = useQuery<PokemonListResponse>(
    GET_POKEMON_LIST,
    {variables:{...initVariables, limit}}
  );

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    refetch({...initVariables, search}).then(() => {setSearch(search);});
  }

  const onTypeChange = (e: OnChangeData<string>) => {
    const type = e.selectedItem ?? ""
    refetch({...initVariables, type}).then(() => {setType(type);});
  }

  const onFavoriteFilter = (e: SwitchEventHandlersParams) => {
    const isFavorite = e.name === 'favorite';
    refetch({...initVariables, isFavorite}).then(() => {setFavorite(isFavorite);});
  }

  const onGridChange = (e: SwitchEventHandlersParams) => {
    if (e.name !== 'list' && e.name !== 'grid') {
      setView('list');
      throw new Error('Invalid view type');
    }
    setView(e.name);
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || loading || error || (data?.pokemons.edges.length ?? 0) < limit || isFetching) {return;}
        setIsFetching(true);
        fetchMore({variables:{...initVariables, offset: data?.pokemons.edges.length ?? 0}}).then((q) => {
          setLimit(limit + (q.data?.pokemons.edges.length ?? 0));
        }).finally(() => {setIsFetching(false);})
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
  }, [observerTarget, loading, error, fetchMore, initVariables, data, limit, isFetching]);

  let content = (<Content pokemons={[]} isLoading={true} isList={view === 'list'} />);
  if (error) {
    // Raise a bug/refresh?
    content = (<div>PokeNet failed.. :(</div>);
  } else if (data) {
    content = (<Content pokemons={data.pokemons.edges} isLoading={loading || isFetching} isList={view === 'list'} />);
  }
  
  return (
    <div className={styles.page}>
        <FilterToolbar onSearch={onSearch} onTypeChange={onTypeChange} onFavoriteFilter={onFavoriteFilter} onGridChange={onGridChange} />
        {content}
        <div ref={observerTarget}></div>
    </div>
  );
}

function Content({pokemons, isList, isLoading = false}: {pokemons: PokemonInfo[], isList: boolean, isLoading?: boolean}) {
  const layout = isList ? {span: 16} : {span: 4};

  const loadingPokemons = isLoading ? Array(8).fill(null).map((_, index) => (
    <Column key={index} style={{paddingBottom: 10}} {...layout}>
      <CardSkeleton isDetail={false} isList={isList}/>
    </Column>
  )) : null;

  const pokemonCards = pokemons.map((p) => {return (<Column style={{paddingBottom: 10}} {...layout} key={"col"+p.id}><Card key={"pokemon"+p.id} pokemon={p} isList={isList}/></Column>);});

  if (!isLoading && !pokemonCards.length) {
    return (<div>No pokemons found...</div>);
  }

  return (<Grid style={{marginBottom: 10}}>
    {pokemonCards}
    {loadingPokemons}
  </Grid>);
}

function FilterToolbar({ onSearch, onTypeChange, onFavoriteFilter, onGridChange}: {onSearch: (i: React.ChangeEvent<HTMLInputElement>)=>void, onTypeChange: (i: OnChangeData<string>)=>void, onFavoriteFilter: (i: SwitchEventHandlersParams)=>void, onGridChange: (i: SwitchEventHandlersParams)=>void}) {
  const {error, data} = useQuery<PokemonTypesResponse>(GET_POKEMON_TYPES);
  if (error) {
    return (<div>Error loading types</div>)
  }
  return (
    <div>
      <Grid style={{alignItems: 'end'}}>
        <Column span={16} style={{paddingBottom: 10}}>
         <ContentSwitcher selectedIndex={0} onChange={onFavoriteFilter} size={"lg"}>
            <Switch name="all" text="All" />
            <Switch name="favorite" text="Favorites" />
          </ContentSwitcher>
        </Column>
        <Column span={8} style={{paddingBottom: 10}}>
          <TextInput placeholder="Search" labelText="" id="search-bar" type="text" onChange={onSearch} />
        </Column>
        <Column span={6} style={{paddingBottom: 10}}>
          <ComboBox id="pokemonType" placeholder="Type" titleText="" items={data?.pokemonTypes ?? []} onChange={onTypeChange} />
        </Column>
        <Column span={2} style={{paddingBottom: 10}}>
          <ContentSwitcher selectedIndex={0} onChange={onGridChange} size={"sm"}>
            <Switch name="grid"><GridIcon /></Switch>
            <Switch name="list"><ListIcon /></Switch>
          </ContentSwitcher>
        </Column>
      </Grid>
    </div>
  )
}


interface PokemonTypesResponse {
  pokemonTypes: string[];
}

const GET_POKEMON_TYPES = gql`
  query { pokemonTypes }
`;