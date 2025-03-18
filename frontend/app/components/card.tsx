"use client";
import Image from "next/image";
import styles from "./card.module.scss";
import { gql, useMutation } from '@apollo/client';
import {Tile, ToastNotification, SkeletonPlaceholder, SkeletonText} from "@carbon/react"
import {Favorite, FavoriteFilled, } from '@carbon/icons-react';
import {useState, useEffect, Fragment} from 'react';
import {PokemonInfo} from '../shared/types';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation'

const ADD_FAVORITE_POKEMON = gql`
  mutation FavoritePokemon($id: ID!) { favoritePokemon(id: $id) { id, name } }
`;

const REMOVE_FAVORITE_POKEMON = gql`
  mutation UnfavoritePokemon($id: ID!) { unFavoritePokemon(id: $id) { id, name } }
`;

export interface CardProps {
  pokemon: PokemonInfo;
  // Use an enum for Grid/List/Detail?
  isList: boolean;
  isDetail?: boolean;
}

export function Card({pokemon, isList, isDetail = false}: CardProps) {
  const [favorite, setFavorite] = useState(pokemon.isFavorite);
  const [addFavorite, addRes] = useMutation(ADD_FAVORITE_POKEMON);
  const [removeFavorite, removeRes] = useMutation(REMOVE_FAVORITE_POKEMON);
  const [toast, showToast] = useState<ToastProps|null>(null)
  const router = useRouter()

  useEffect(() => {
    const res = favorite ? removeRes : addRes;
    const title = `${pokemon.name} favorite ${favorite ? "removed" : "added"}`
    if (res.error) {
      showToast({title, kind: 'error'});
    } else if (res.data){
      // Resets the response so we don't fall in this branch again
      res.reset();
      showToast({title, kind: 'success'});
      setFavorite(!favorite);
    }
  }, [addRes, removeRes, favorite, pokemon.name]);


  const onFavorite = () => {
    const variables = {variables: {id: pokemon.id}};
    if (favorite) {
      removeFavorite(variables);
    } else {
      addFavorite(variables);
    }
  }

  const toDetail = () => {
    if (isDetail) {return;}
    router.push(`/${pokemon.name}`)
  }

  const additionalDetails = (
    <Fragment>
      <div style={{width: '100%'}}>
        <Indicator val={pokemon.maxCP} text="CP" style={styles.indicator_cp}/>
        <Indicator val={pokemon.maxHP} text="HP" style={styles.indicator_hp}/>
      </div>
      <div className={styles.row}>
        <Measurement text="Weight" val={pokemon.weight} />
        <Measurement text="Height" val={pokemon.weight} />
      </div>
    </Fragment>
  )

  return (
    <div>
      {toast ? <ToastContainer title={toast.title} kind={toast.kind}/> : undefined}
      <Tile className={isList ? styles.card___in_list : styles.card___in_grid}>
        <div className={isDetail ? '' : styles.is_clickable} onClick={toDetail} style={{height: isList ? 70 : 300, width: isList ? 70 : '100%', padding: isList ? '5px 5px' : '20px 10px', backgroundColor: 'white', marginBottom: isList? 0 : 10, marginRight: isList ? 10 : 0, alignContent: 'center', textAlign: 'center'}}>
            <Image
              aria-hidden
              src={pokemon.image}
              alt={pokemon.name}
              width={1700}
              height={1700}
              style={{width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%'}}
            />
        </div>
        <div className={styles.card_subline}>
          <div>
            <h3 className={isDetail ? '' : styles.is_clickable} onClick={toDetail}>{pokemon.name}</h3>
            <p>{pokemon.types.join(", ")}</p>
          </div>
          <div className={styles.is_clickable + ' ' + styles.favorite} onClick={onFavorite}>{favorite ? <FavoriteFilled /> : <Favorite />}</div>
        </div>
        {isDetail ? additionalDetails : null}
      </Tile>
    </div>
  )
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
        <div style={{height: isList ? 70 : 300, width: isList ? 70 : '100%', backgroundColor: 'white', marginBottom: isList? 0 : 10, marginRight: isList ? 10 : 0,  alignContent: 'center', textAlign: 'center'}}>
          <SkeletonPlaceholder className={styles.skeleton_image} />
        </div>
        <div className={styles.skeleton_subline}>
          <SkeletonText className={styles.skeleton_text} />
          <SkeletonText className={styles.skeleton_text} />
        </div>
        <div style={{display: isDetail ? 'block' : 'none'}} className={styles.skeleton_subline}>
          <SkeletonText className={styles.skeleton_text} />
          <SkeletonText className={styles.skeleton_text} />
        </div>
      </Tile>
    </div>
  )
}


interface ToastProps {
    kind: 'error' | 'success' | 'warning' | 'info';
    title: string;
    timeout?: number;
}

export const ToastContainer = ({ title, kind, timeout = 30000 }: ToastProps) => {
return createPortal(
        <ToastNotification
        kind={kind}
        timeout={timeout}
        title={title}
        style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 9999,
        }}
        />,
        document.body,
        'toast-container'
    );
};