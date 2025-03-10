// Stanza required for the apollo next.js integration
"use client";
import Image from "next/image";
import styles from "./page.module.scss";
import Link from 'next/link'
import { gql, useSuspenseQuery, useQuery } from '@apollo/client';
import {Tile, Dropdown, TextInput, ContentSwitcher, Switch, Loading, Grid, Column} from "@carbon/react"
import {SwitchEventHandlersParams} from "@carbon/react/lib/components/ContentSwitcher/ContentSwitcher";
import {OnChangeData} from "@carbon/react/lib/components/Dropdown/Dropdown";
import {Favorite, FavoriteFilled, List as ListIcon, Grid as GridIcon} from '@carbon/icons-react';
import {useState} from 'react'


interface PokemonListResponse {
  pokemons: {edges: PokemonInfo[]}
}

const GET_POKEMON_LIST = gql`
  query PokemonList($limit: Int!, $search: String, $type: String, $isFavorite: Boolean) { 
    pokemons(query: { limit: $limit, offset: 0, search: $search, filter: {isFavorite: $isFavorite, type: $type} }) {
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

interface PokemonInfo {
  id: number,
  name: string,
  types: string[],
  image: string,
  isFavorite: boolean,
}

export default function Home() {
  const [view, setView] = useState<'list'|'grid'>('grid');
  const [favorite, setFavorite] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [type, setType] = useState<string>("");

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }

  const onTypeChange = (e: OnChangeData<string>) => {
    setType(e.selectedItem ?? "");
  }

  const onFavoriteFilter = (e: SwitchEventHandlersParams) => {
    setFavorite(e.name === 'favorite');
  }

  const onGridChange = (e: SwitchEventHandlersParams) => {
    if (e.name !== 'list' && e.name !== 'grid') {
      setView('list');
      throw new Error('Invalid view type');
    }
    setView(e.name);
  }

  const { data, error } = useQuery<PokemonListResponse>(
    GET_POKEMON_LIST,
    {variables:{search: search, type: type, favorite: favorite, limit: limit}}
  );
  let content = (<Loading />);
  if (error) {
    // Raise a bug/refresh?
    content = (<div>PokeNet failed.. :(</div>);
  } else if (data) {
    content = (<Content pokemons={data.pokemons.edges} isList={view === 'list'} />);
  }
  
  return (
    <div className={styles.page}>
        <FilterToolbar onSearch={onSearch} onTypeChange={onTypeChange} onFavoriteFilter={onFavoriteFilter} onGridChange={onGridChange} />
        {content}
    </div>
  );
}

function Content({pokemons, isList}: {pokemons: PokemonInfo[], isList: boolean}) {
  const layout = isList ? {xl: 16, lg:16, md:16, sm:16, xs:16} : {xl:4, lg:4, md:4, sm:4, xs:4};
  return (<Grid>
    {pokemons.map((p) => {return (<Column {...layout} key={"col"+p.id}><PokemonCard key={"pokemon"+p.id} pokemon={p} isList={isList}/></Column>);})}
  </Grid>);
}

function PokemonCard({pokemon, isList}: {pokemon: PokemonInfo, isList: boolean}) {
  return (
    <div>
      <Tile className={isList ? styles.card___in_list : styles.card___in_grid}>
        <Link href={pokemon.name}>
          <Image
            aria-hidden
            src={pokemon.image}
            alt={pokemon.name}
            width={200}
            height={200}
          />
        </Link>
        <div className={styles.card_subline}>
          <div>
            <h3>{pokemon.name} {"#"+pokemon.id}</h3>
            <p>{pokemon.types.join(", ")}</p>
          </div>
          {pokemon.isFavorite ? <FavoriteFilled /> : <Favorite />}
        </div>
      </Tile>
    </div>
  )
}

function FilterToolbar({ onSearch, onTypeChange, onFavoriteFilter, onGridChange}: {onSearch: (i: React.ChangeEvent<HTMLInputElement>)=>void, onTypeChange: (i: OnChangeData<string>)=>void, onFavoriteFilter: (i: SwitchEventHandlersParams)=>void, onGridChange: (i: SwitchEventHandlersParams)=>void}) {
  const {error, data} = useSuspenseQuery<PokemonTypesResponse>(GET_POKEMON_TYPES);
  if (error) {
    return (<div>Error loading types</div>)
  }
  return (
    <div>
      <ContentSwitcher selectedIndex={0} onChange={onFavoriteFilter} size={"lg"}>
        <Switch name="all" text="All" />
        <Switch name="favorite" text="Favorites" />
      </ContentSwitcher>
      <Dropdown
      id="pokemonType"
      titleText="Type"
      label="Type"
      items={data.pokemonTypes}
      onChange={onTypeChange}
      />
      <TextInput labelText="Search" id="search-bar" type="text" onChange={onSearch} />
      <ContentSwitcher selectedIndex={0} onChange={onGridChange} size={"sm"}>
        <Switch name="grid"><GridIcon /></Switch>
        <Switch name="list"><ListIcon /></Switch>
      </ContentSwitcher>
    </div>
  )
}


interface PokemonTypesResponse {
  pokemonTypes: string[];
}

const GET_POKEMON_TYPES = gql`
  query { pokemonTypes }
`;