"use client";
import Image from "next/image";
import styles from "./card.module.scss";
import { gql, useMutation } from '@apollo/client';
import {Tile, SkeletonPlaceholder, SkeletonText, Loading} from "@carbon/react"
import {Favorite, FavoriteFilled, VolumeUpFilled } from '@carbon/icons-react';
import {useState, useEffect, Fragment} from 'react';
import {PokemonInfo} from '../shared/types';
import { useRouter } from 'next/navigation'
import { useAppDispatch } from "@/lib/hooks";
import { addToast } from "@/lib/features/toast/toastSlice";
import { ApolloCache } from "@apollo/client";


const ADD_FAVORITE_POKEMON = gql`
  mutation FavoritePokemon($id: ID!) {
    favoritePokemon(id: $id) {
      id,
      name,
      types,
      image,
      isFavorite,
    }
  }
`;

const REMOVE_FAVORITE_POKEMON = gql`
  mutation UnfavoritePokemon($id: ID!) {
    unFavoritePokemon(id: $id) {
      id,
      name,
      types,
      image,
      isFavorite,
    }
  }
`;

export interface CardProps {
  pokemon: PokemonInfo;
  isList: boolean;
  isDetail?: boolean;
}

interface CacheRef {
  __ref: string;
}

export function Card({pokemon, isList, isDetail = false}: CardProps) {
  // Updates the favorite pokemon when mutation is executed
  const modifyCache = (cache: ApolloCache<unknown>, prev: {edges: CacheRef[]}, data?: PokemonInfo) => {
    if (!data) {
      return prev;
    }
    const newPokemonsRef = cache.writeFragment({
      data,
      fragment: gql`
        fragment NewPokemon on Pokemon {
          id,
          name,
          types,
          image,
          isFavorite,
        }
      `,
    });
    if (!newPokemonsRef) {return prev;}

    const index = prev.edges.findIndex((p: {__ref: string}) => p.__ref === newPokemonsRef?.__ref)
    if (index < 0) {return prev;}

    const edges = [...prev.edges];
    edges.splice(index, 1, newPokemonsRef);
    return {...prev, edges};
  }

  const [favorite, setFavorite] = useState(pokemon.isFavorite);
  const [addFavorite, addRes] = useMutation(ADD_FAVORITE_POKEMON, {
    update(cache, data) {
      cache.modify({
        fields: {
          pokemons(existingPokemons) {
            return modifyCache(cache, existingPokemons, data.data?.favoritePokemon);
          }
        }
      });
    }
  });
  const [removeFavorite, removeRes] = useMutation(REMOVE_FAVORITE_POKEMON, {
    update(cache, data) {
      cache.modify({
        fields: {
          pokemons(existingPokemons) {
            return modifyCache(cache, existingPokemons, data.data?.unFavoritePokemon);
          }
        }
      });
    }
  });
  const dispatch = useAppDispatch();

  const [isNavigating, setNavigationLoader] = useState(false);

  useEffect(() => {
    const res = favorite ? removeRes : addRes;
    const title = `${pokemon.name} favorite ${favorite ? "removed" : "added"}`
    if (res.error) {
      dispatch(addToast({title, kind: 'error'}));
    } else if (res.data){
      // Resets the response so we can rely on the response as source of truth for signalling
      res.reset();
      dispatch(addToast({title, kind: 'success'}));
      setFavorite(!favorite);
    }
  }, [addRes, removeRes, favorite, pokemon.name, dispatch]);


  // Executes favorite mutation on interaction
  const onFavorite = () => {
    const variables = {variables: {id: pokemon.id}};
    if (favorite) {
      removeFavorite(variables);
    } else {
      addFavorite(variables);
    }
  }

  const router = useRouter()
  const toDetail = () => {
    if (isDetail) {return;}
    // Add navigation loader
    setNavigationLoader(true);
    router.push(`/${pokemon.name}`)
  }

  // Additional details, shown only when isDetail is true
  const additionalDetails = (
    <Fragment>
      <div style={{width: '100%'}}>
        <Indicator val={pokemon.maxCP} text="CP" style={styles.indicator_cp}/>
        <Indicator val={pokemon.maxHP} text="HP" style={styles.indicator_hp}/>
      </div>
      <div className={styles.measurement_grid}>
        <Measurement text="Weight" val={pokemon.weight} />
        <Measurement text="Height" val={pokemon.weight} />
      </div>
    </Fragment>
  )

  return (
    <div>
      {isNavigating ? <Loading /> : null}
      <Tile className={isList ? styles.card___in_list : styles.card___in_grid}>
        <div className={`${isDetail ? '' : styles.is_clickable} ${isList ? styles.img__in_list : styles.img__in_grid}`} onClick={toDetail}>
            <Image
              aria-hidden
              src={pokemon.image}
              alt={pokemon.name}
              width={1700}
              height={1700}
              style={{width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%'}}
            />
            {pokemon.sound ? <div className={styles.sound_wrapper}><PlaySound sound={pokemon.sound}/></div> : null}
        </div>
        <div className={styles.card_subline}>
          <div>
            <h3 className={isDetail ? '' : styles.is_clickable} onClick={toDetail}>{pokemon.name}</h3>
            <p>{pokemon.types.join(", ")}</p>
          </div>
          <div className={styles.is_clickable + ' ' + styles.favorite} onClick={onFavorite}>
            {favorite ? <FavoriteFilled /> : <Favorite />}
          </div>
        </div>
        {isDetail ? additionalDetails : null}
      </Tile>
    </div>
  )
}

function PlaySound({sound}: {sound: string}) {
  const audio = new Audio(sound);
  const onClick = () => {
    audio.play();
  }
  return (<VolumeUpFilled width={30} height={30} onClick={onClick} />);
}

function Measurement({val, text}: {val?: {minimum: number, maximum: number}, text: string}) {
  return (
    <Tile className={styles.measurement_container}>
      <p style={{fontWeight: 'bold'}}>{text}</p>
      {val ? <p>{val.minimum} - {val.maximum}</p> : '???'}
    </Tile>
  )
}

function Indicator({val, text, style}:{val?: number,text: string, style: string}) {
  if (val === undefined) { return null;}
  return (
    <div className={styles.indicator_container}>
      <div className={style}></div>
      <p className={styles.indicator_text}>{text}: {val}</p>
    </div>
  )
}

interface CardSkeletonProps {
  isList: boolean;
  isDetail: boolean;
}

export function CardSkeleton({isList, isDetail}: CardSkeletonProps) {
  return (
    <div>
      <Tile className={isList ? styles.card___in_list : styles.card___in_grid}>
        <div className={isList ? styles.skeleton_image___in_list : styles.skeleton_image___in_grid}>
          <SkeletonPlaceholder className={styles.skeleton_image_content}/>
        </div>
        <div className={styles.skeleton_subline}>
          <SkeletonText className={styles.skeleton_text} />
          <SkeletonText className={styles.skeleton_text} />
        </div>
        {
        isDetail ?
          <div className={styles.skeleton_subline}>
            <SkeletonText className={styles.skeleton_text} />
            <SkeletonText className={styles.skeleton_text} />
          </div> : null
        }
      </Tile>
    </div>
  )
}