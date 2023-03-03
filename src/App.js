import React, { useState, useEffect, useCallback } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead'; 
import Accordion from 'react-bootstrap/Accordion';
import logo from './logo.svg';
import pokeBall from './assets/images/poke-ball.png';

function App() {
  const [singleSelections, setSingleSelections] = useState([]);
  const [pokemonList, setPokemonList] = useState([]);
  const [currentPokemon, setCurrentPokemon] = useState([]);
  const [pokemonAbilities, setPokemonAbilities] = useState([]);
  const [pokemonMoves, setPokemonMoves] = useState([]);
  const [pokemonSprites, setPokemonSprites] = useState([]);
  const [pokemonStats, setPokemonStats] = useState([]);
  const [pokemonTypes, setPokemonTypes] = useState([]);
  const [pokemonWeight, setPokemonWeight] = useState([]);
  const [pokemonFlavorText, setPokemonFlavorText] = useState("");
  const [pokemonData, setShowPokemonData] = useState(false);
  let resultArr = [];

  const fetchPokemonList = useCallback(async () => {
    let url = "https://pokeapi.co/api/v2/pokemon?limit=9999";
    await fetch(url).then((res) => res.json()).then((json) => {
      let fetchedData = json.results;
      for (let i = 0; i < fetchedData.length; i++) {
        let name = fetchedData[i].name
        resultArr.push(name);
      }
      const withoutDupes = [...new Set(resultArr)];
      setPokemonList(withoutDupes);
      localStorage.setItem('PokemonList',JSON.stringify(withoutDupes));
    })
  });

  const fetchPokemonData = useCallback(async (selected) => {
    document.querySelectorAll(".rbt-input-main").textContent = "";
    if (selected.length > 0) {
      let url = "https://pokeapi.co/api/v2/pokemon/" + selected,
      speciesUrl = "https://pokeapi.co/api/v2/pokemon-species/" + selected,
      evolutionUrl = "",
      abilities = localStorage.getItem(selected + "-abilities"),
      moves = localStorage.getItem(selected + "-moves"),
      sprites = localStorage.getItem(selected + "-sprites"),
      stats = localStorage.getItem(selected + "-stats"),
      types = localStorage.getItem(selected + "-types"),
      weight = localStorage.getItem(selected + "-weight"),
      flavorTxt = localStorage.getItem(selected + "-flavortext");

    if (!abilities || !moves || !sprites || !stats || !types || !weight || !flavorTxt) {
      await fetch(url).then((res) => res.json()).then((json) => {
        setPokemonAbilities(json.abilities);
        setPokemonMoves(json.moves);
        setPokemonSprites(json.sprites);
        setPokemonStats(json.stats);
        setPokemonTypes(json.types);
        setPokemonWeight(json.weight);
        localStorage.setItem(selected + "-abilities",[JSON.stringify(json.abilities)]);
        localStorage.setItem(selected + "-moves",[JSON.stringify(json.moves)]);
        localStorage.setItem(selected + "-sprites",[JSON.stringify(json.sprites)]);
        localStorage.setItem(selected + "-stats",[JSON.stringify(json.stats)]);
        localStorage.setItem(selected + "-types",[JSON.stringify(json.types)]);
        localStorage.setItem(selected + "-weight",[JSON.stringify(json.weight)]);
      });
      await fetch(speciesUrl).then((res) => res.json()).then((json) => {
        evolutionUrl = json.evolution_chain;
        for (let i = 0; i < json.flavor_text_entries.length; i++) {
          let versionName = json.flavor_text_entries[i].version.name;
          if (versionName === "red") {
            let flavorTxt = json.flavor_text_entries[i].flavor_text;
            if (flavorTxt) {
              setPokemonFlavorText(json.flavor_text_entries[i].flavor_text);
            } else {
              setPokemonFlavorText("No description found.");
            }
            localStorage.setItem(selected + "-flavortext",JSON.stringify(json.flavor_text_entries[i].flavor_text));
            return;
          }
        }
      });
    } else {
      setPokemonAbilities(JSON.parse(abilities));
      setPokemonMoves(JSON.parse(moves));
      setPokemonSprites(JSON.parse(sprites));
      setPokemonStats(JSON.parse(stats));
      setPokemonTypes(JSON.parse(types));
      setPokemonWeight(JSON.parse(weight));
      setPokemonFlavorText(JSON.parse(flavorTxt));
    }
    setCurrentPokemon(String(selected));
    setShowPokemonData(true);
    }
  });

  const setLocalStorage = (cachedData) => {
    setPokemonList(cachedData);
  }

  const capitalizeStr = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  useEffect(() => {
    let cachedData = JSON.parse(localStorage.getItem('PokemonList'));
    if (!cachedData) {
      fetchPokemonList();
    } else {
      setLocalStorage(cachedData);
    }
  }, []);

  return (
    <div className="App">
      <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark static-top">
        <div className="container">
          <a className="navbar-brand" href="./">
            <img src={pokeBall} alt="Pokémon Ball" height="36" />
            &nbsp;&nbsp;&nbsp;Pokémon Search Engine
          </a>
        </div>
      </nav>
      </header>
      <div className="header">
        <div className="logo-wrapper">
          <img src={logo} className="logo" alt="logo" />
          <img src={pokeBall} className="poke-ball" alt="Poke Ball" />
        </div>
        <div className="search-wrapper">
          <h1>Start Discovering</h1>
          <Typeahead
            id="basic-typeahead-single"
            labelKey="name"
            options={pokemonList}
            placeholder="Choose a pokémon..."
            selected={singleSelections}
            onChange={(singleSelections) => {
              setSingleSelections(singleSelections);
              fetchPokemonData(singleSelections);
            }}
          />
        </div>
      </div>
      <main>
        {pokemonData && (
          <div>
            <div className="container">
              <div className="row">
                <article className="col-12 col-sm-6 col-md-6 col-lg-3 col-xl-3">
                  <div className="card bg-light mb-3 h-100 w-100 column-margin">
                    <div className="card-header">Pokémon</div>
                    <div className="card-body">
                      <img src={pokemonSprites.back_default} alt="Back default sprite" />
                      <img src={pokemonSprites.back_shiny} alt="Back shiny sprite" />
                      <img src={pokemonSprites.front_default} alt="Front default sprite" />
                      <img src={pokemonSprites.front_shiny} alt="Front shiny sprite" />
                      <h5 className="card-title">{capitalizeStr(currentPokemon)}</h5>
                      <p className="card-text">{pokemonFlavorText}</p>
                    </div>
                  </div>
                </article>
                <article className="col-12 col-sm-6 col-md-6 col-lg-3 col-xl-3">
                  <div className="card bg-light mb-3 h-100 w-100 column-margin">
                    <div className="card-header">Stat</div>
                    <div className="card-body">
                      {pokemonStats.map((statKey, i) => (
                        <div key={i}>
                          <p><strong>{capitalizeStr(statKey.stat.name)}</strong>:&nbsp;{statKey.base_stat}</p>
                        </div>
                      ))}
                      <p><strong>Weight</strong>:&nbsp;{pokemonWeight}</p>
                    </div>
                  </div>
                </article>
                <article className="col-12 col-sm-6 col-md-6 col-lg-3 col-xl-3">
                  <div className="card bg-light mb-3 h-100 w-100 column-margin">
                    <div className="card-header">Type</div>
                    <div className="card-body">
                      {pokemonTypes.map((typeKey, i) => (
                        <div key={i}>
                          <p><span className={"tag " + typeKey.type.name}>{typeKey.type.name}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
                <article className="col-12 col-sm-6 col-md-6 col-lg-3 col-xl-3">
                  <div className="card bg-light mb-3 h-100 w-100 column-margin">
                    <div className="card-header">Ability</div>
                    <div className="card-body">
                      {pokemonAbilities.map((abilityKey, j) => (
                        <div key={j}>
                          <p><span className="tag dark">{capitalizeStr(abilityKey.ability.name)}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              </div>
            </div>
            <hr />
            <article className="container">
              <h2>Moves</h2>
              <Accordion defaultActiveKey="0">
                {pokemonMoves.map((movesKey, k) => (
                    <Accordion.Item eventKey={k}>
                      <Accordion.Header>#{k}&nbsp;{capitalizeStr(movesKey.move.name)}</Accordion.Header>
                      <Accordion.Body>
                        <table className="table table-striped table-sm">
                          <thead className="thead-dark">
                            <tr>
                              <th scope="col">Version</th>
                              <th scope="col">Level Learned At</th>
                            </tr>
                          </thead>
                          <tbody>
                              <tr key={k}>
                                <td>
                                  {movesKey.version_group_details.map((versionNameKey, l) => (
                                    <div key={l}>
                                      {versionNameKey.version_group.name.toUpperCase()}
                                    </div>
                                  ))}
                                </td>
                                <td>
                                  {movesKey.version_group_details.map((versionGroupKey, m) => (
                                    <div key={m}>
                                      {versionGroupKey.level_learned_at}
                                    </div>
                                  ))}
                                </td>
                              </tr>
                          </tbody>
                        </table>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
              </Accordion>
            </article>
          </div>
        )};
      </main>
      {/* footer */}
      <footer className="footer">
          <div className="vertical-center">
              <h4>&copy; 2023 Erin Keller</h4>
          </div>
      </footer>
    </div>
  );
}

export default App;
