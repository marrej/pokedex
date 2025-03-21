# implementation notes

This piece was implemented in CodeAnywhere environment (hence references to .coderanywhere URLs), since localhost runtimes are not fully supported.

## How to run

To run the frontend run `npm run dev`. The production bould requires building and isn't optimized.
Turbo build has been disabled to avoid issues with sass imports.

## Design details

- Uses redux for general app state (e.g. Toast, Filters)
    - This allows for cleaner ownership (content handles its own fetchin/inf scroll & just reacts to state change)
- Use apollo for data state (e.g. Updates the cache on mutations to avoid unneccessary refetches)
- Uses Carbon elements for standardized buildup
- Uses grid for Pokemon Cards (using standardized breakpoints + mobile phone breakpoint)