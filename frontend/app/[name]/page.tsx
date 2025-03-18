// Stanza required for the apollo next.js integration
"use client";

import { CardSkeleton, Card } from "../components/card";
import { PokemonDetail } from "../shared/types";
import { gql, useQuery } from '@apollo/client';
import { useParams } from 'next/navigation'
import { Grid, Column} from "@carbon/react"

const GET_POKEMON_DETAILS = gql`
  query PokemonByName($name: String!) { 
    pokemonByName(name: $name) {
        id,
        name,
        types,
        image,
        isFavorite,
    		sound,
        maxCP,
        maxHP,
        weight {minimum, maximum},
    		height {minimum, maximum},
    		evolutions {id, name, image, isFavorite}
    }
  }
`;

interface PokemonDetailsResponse {
    pokemonByName: PokemonDetail;
}

export default function Detail() {
    const { name } = useParams();
    const { loading, data, error } = useQuery<PokemonDetailsResponse>(
        GET_POKEMON_DETAILS,
        {variables:{name}}
    );
    if (loading) {
      return (<div style={{padding: 10}}><CardSkeleton isList={false} isDetail={true} /></div>)
    }
    if (!data || error) {
      return (<div style={{padding: 10}}>PokeNet failed.. :(</div>);
    }

    const evolutions = (
      <div style={{marginTop: 10}}>
        <h2>Evolutions</h2>
        <Grid>
          {
          (data.pokemonByName.evolutions ?? []).map(p => {
            return (
              <Column style={{marginBottom: 10}} lg={'75%'} md={'50%'} sm={'100%'} key={"col"+p.id}>
                <Card key={"pokemon"+p.id} pokemon={{...p, types: []}} isList={false}/>
              </Column>
            );
          })}
        </Grid>
      </div>
    );

    return (
      <div style={{padding: 10}}>
        <Card pokemon={data.pokemonByName} isList={false} isDetail={true}/>
        {evolutions}
      </div>
    )
}