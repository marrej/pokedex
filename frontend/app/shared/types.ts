export interface PokemonShortInfo {
  id: number,
  name: string;
  image: string,
  isFavorite: boolean,
}

export interface PokemonInfo extends PokemonShortInfo {
  types: string[],
  maxCP?: number,
  maxHP?: number,
  weight?: {minimum: number, maximum: number},
  height?: {minimum: number, maximum: number},
  sound?: string,
}

export interface PokemonDetail extends PokemonInfo {
  evolutions?: PokemonShortInfo[]
}