// Stanza required for the apollo next.js integration
"use client";
import styles from "./page.module.scss";
import { CardSkeleton, Card } from "../components/card";
import { PokemonDetail } from "../shared/types";
import { gql, useQuery } from '@apollo/client';
import { useParams } from 'next/navigation'
import { ErrorMessage, Message } from "@/app/components/message"

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

    if (error) {
      return (<ErrorMessage />);
    } else if (!data) {
      return <Message title={`${name} not found`} subtitle={"Please try a different pokemon name"} />
    }

    const evolutions = (
      <div style={{marginTop: 10}}>
        <h2>Evolutions</h2>
        <div className={styles.grid}>
          {
          (data.pokemonByName.evolutions ?? []).map(p => {
            return (
              <div key={"pokemon_wrapper"+p.id} className={styles.card_wrapper}>
              <Card key={"pokemon"+p.id} pokemon={{...p, types: []}} isList={false}/>
              </div>
            );
          })}
        </div>
      </div>
    );

    return (
      <div style={{padding: 10}}>
        <Card pokemon={data.pokemonByName} isList={false} isDetail={true}/>
        {evolutions}
      </div>
    )
}