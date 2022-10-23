const main = document.querySelector('main');
const container = document.querySelector('.box');
const btnPrev = document.querySelector('#prev');
const btnNext = document.querySelector('#next');

const baseUrl = 'https://pokeapi.co/api/v2/pokemon/';
let nextUrl, prevUrl, pokemons;

fetchPoki(baseUrl);

async function getData(url) {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`status: ${response.status}`);
  } else {
    const jsonData = await response.json();
    return jsonData
  }
}

async function fetchPoki(url) {
  const { next, previous, results } = await getData(url);

  nextUrl = next;
  prevUrl = previous;
  pokemons = results;

  let pokiUrl = [];

  for (let pokemon of pokemons) {
    const card = document.createElement('div');
    card.className = 'card'
    const image = document.createElement('img');
    const name = document.createElement('p');
    const pokiId = document.createElement('span')

    container.append(card);
    card.append(pokiId, image, name);

    name.append(`${pokemon.name}`)

    pokiUrl.push(pokemon.url);

    await Promise.all(pokiUrl.map(el => getData(el)))
      .then(url => url.forEach(url => {
        let sprite = url.sprites.other['official-artwork'].front_default
        || url.sprites.other.home.front_default
        || url.sprites.other.dream_world.front_default
        || url.sprites.front_default
        || '/no_foto.jpg';
        image.setAttribute('src', `${sprite}`); 
        pokiId.innerHTML = String(url.id).padStart(3, 0);
      })
    )
    openCard(card, pokemon, image)
  }

  btnPrev.addEventListener('click', goPrev);
  btnNext.addEventListener('click', goNext);

  disableBtn();
}

function goPrev() {
  if (prevUrl) {
    container.innerHTML = '';
    fetchPoki(prevUrl);
  }
}

function goNext() {
  if (nextUrl) {
    container.innerHTML = '';
    fetchPoki(nextUrl);
  }
}

function disableBtn() {
  (!prevUrl) ? 
    btnPrev.setAttribute('style', 'disabled; background-color: #ddd; color: #fff; cursor: not-allowed') : 
    btnPrev.removeAttribute('style');
  (!nextUrl) ? 
    btnNext.setAttribute('style', 'disabled; background-color: #ddd; color: #fff; cursor: not-allowed') :
    btnNext.removeAttribute('style');
}

function openCard(card, pokemon, image) {
  card.addEventListener('click', () => {
    const opacity = document.createElement('div');
    opacity.className = 'opacity click';
    document.querySelector('body').append(opacity);

    const openCard = document.createElement('div');
    openCard.className = 'info';
    container.append(openCard);

    const pokiName = document.createElement('p');
    pokiName.className = 'name';
    pokiName.append(`${pokemon.name}`);

    const span = document.createElement('div');
    span.className = 'span click';

    openCard.append(span, image.cloneNode(), pokiName);

    getData(pokemon.url)
    .then(data => {
      const ability = document.createElement('p');
      openCard.append(ability);
      for (let ab of data.abilities) {
        const abilityItem = document.createElement('span');
        abilityItem.className = 'ability';
        abilityItem.append(`${ab.ability.name} `);
        ability.append(abilityItem);
      }

      const size = document.createElement('p');
      size.className = 'size';
      size.append(`height: ${data.height}, weight: ${data.weight}`);
      openCard.append(size);

      data.stats.map(stat => {
        const value = stat.base_stat;
        const statsName = stat.stat.name;
        const stats = document.createElement('div');
        stats.className = 'stats';

        const hp = value * 2 + 204;
        const otherStat = Math.floor((value * 2 + 99) * 1.1);

        if (statsName === 'hp') {
          stats.innerHTML = `${statsName} <progress value='${value}' max='${hp}'></progress> ${value}`;
        } else {
          stats.innerHTML = `${statsName} <progress value='${value}' max='${otherStat}'></progress> ${value}`;
        }
        
        openCard.append(stats);
      })

      return data.species;
    })
    .then(data => {
      fetch(data.url)
      .then(response => response.json())
      .then(data => {
        data.flavor_text_entries.reverse();
        for (let text of data.flavor_text_entries) {
          if (text.language.name === 'en') {
            const descr = document.createElement('p');
            descr.className = 'descr';
            openCard.append(descr);
            return descr.innerHTML = text.flavor_text;
          }
        }
      })
    })
    closeCard(opacity, openCard);
  })
}

function closeCard(opacity, openCard) {
  const click = document.querySelectorAll('.click');
  click.forEach(el => {
    el.addEventListener('click', () => {
      openCard.remove();
      opacity.remove();
    })
  })
}