import styles from "./toolbar.module.scss";
import { gql, useQuery } from '@apollo/client';
import { ComboBox, TextInput, ContentSwitcher, Switch, Grid, Column} from "@carbon/react"
import {SwitchEventHandlersParams} from "@carbon/react/lib/components/ContentSwitcher/ContentSwitcher";
import {OnChangeData} from "@carbon/react/lib/components/ComboBox/ComboBox";
import { List as ListIcon, Grid as GridIcon} from '@carbon/icons-react';
import { useAppSelector } from "@/lib/hooks";
import { useAppDispatch } from "@/lib/hooks";
import { setSearch, setType, setIsFavorite, setView } from "@/lib/features/filters/filtersSlice";
import { ErrorMessage } from '@/app/components/message';

interface PokemonTypesResponse {
    pokemonTypes: string[];
}
  
const GET_POKEMON_TYPES = gql`
query { pokemonTypes }
`;

export function FilterToolbar() {
    const view = useAppSelector((state) => state.filters.view);
    const search = useAppSelector((state) => state.filters.search);
    const type = useAppSelector((state) => state.filters.type);
    const isFavorite = useAppSelector((state) => state.filters.isFavorite);
    const dispatch = useAppDispatch();
    const {error, data} = useQuery<PokemonTypesResponse>(GET_POKEMON_TYPES);
    if (error) {
      return (<ErrorMessage subtitle={"Types coulnd't be loaded"} />)
    }
  
    const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setSearch(e.target.value ?? ""));
    }
  
    const onTypeChange = (e: OnChangeData<string>) => {
      dispatch(setType(e.selectedItem ?? ""));
    }
  
    const onFavoriteFilter = (e: SwitchEventHandlersParams) => {
      dispatch(setIsFavorite(e.name === 'favorite'));
    }
  
    const onGridChange = (e: SwitchEventHandlersParams) => {
      if (e.name !== 'list' && e.name !== 'grid') {
        dispatch(setView('list'));
        throw new Error('Invalid view type');
      }
      dispatch(setView(e.name));
    }
  
    return (
      <div className={styles.toolbar}>
        <Grid style={{alignItems: 'end'}}>
          <Column span={16} style={{paddingBottom: 10}}>
           <ContentSwitcher selectedIndex={isFavorite ? 1 : 0} onChange={onFavoriteFilter} size={"lg"}>
              <Switch name="all" text="All" />
              <Switch name="favorite" text="Favorites" />
            </ContentSwitcher>
          </Column>
          <Column span={8} style={{paddingBottom: 10}}>
            <TextInput value={search} placeholder="Search" labelText="" id="search-bar" type="text" onChange={onSearch} />
          </Column>
          <Column span={6} style={{paddingBottom: 10}}>
            <ComboBox selectedItem={type} id="pokemonType" placeholder="Type" titleText="" items={data?.pokemonTypes ?? []} onChange={onTypeChange} />
          </Column>
          <Column span={2} style={{paddingBottom: 10}}>
            <ContentSwitcher style={{height: '100%'}} selectedIndex={view === 'grid' ? 0 : 1} onChange={onGridChange} size={"sm"}>
              <Switch name="grid"><GridIcon className={styles.icon} /></Switch>
              <Switch name="list"><ListIcon className={styles.icon} /></Switch>
            </ContentSwitcher>
          </Column>
        </Grid>
      </div>
    )
}