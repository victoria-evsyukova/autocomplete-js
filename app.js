
const serchInput = document.querySelector('.search-input')
const input = document.querySelector('.input')
const menu = document.querySelector('.menu')
const results = document.querySelector('.results')

let currentFocus = -1;

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}


const fetchRepos = debounce(async (e) => {
    let valueInput = e.target.value;
    let searchCache = new Map();

    if (valueInput.length == 0) {
        showSuggestions([]);
        serchInput.classList.remove('active');
        currentFocus = -1;
        return;
    }

    if (searchCache.has(valueInput)) {
        showSuggestions(searchCache.get(valueInput));
        return;
    }

    try {

        let response = await fetch(`https://api.github.com/search/repositories?q=${valueInput}`);

        if (!response.ok){
            if (response.status === 403) {
                throw new Error('Rate limit exceeded')
            }
            throw new Error('HTTP error! ststus', response.status)
        }

        let data = await response.json();
        
        if(!data || !data.items) {
            console.log('empty')
        }

        let repos = data.items;

        if (valueInput.length > 2) {
            const filteredRepos = repos
                .filter(repo => {
                    return repo.name.toLocaleLowerCase().startsWith(valueInput.toLocaleLowerCase())
                })
                .slice(0,5);

            const names = filteredRepos.map(repo => '<li>' + repo.name + '</li>');

            searchCache.set(valueInput, names);
            console.log('Cache', searchCache)

            serchInput.classList.add('active');
            showSuggestions(names);

            let allList = menu.querySelectorAll('li');
            clickElementLi(allList, filteredRepos);

        }

    } catch (error) {
        console.log('Error - ', error.message);
        showSuggestions([]);
        serchInput.classList.remove('active');     
    }

}, 500)


function showSuggestions(list) {
    let listData;
    if (!list.length) {
        userValue = input.value;
        listData = '<li>Not found...</li>';
    } else {
        listData = list.join('')
        console.log(listData)
    }
    menu.innerHTML = listData;
    currentFocus = -1;

}


function clickElementLi(elementsLi, filteredRepos) {
    for (let i = 0; i < elementsLi.length; i++) {
        elementsLi[i].addEventListener('click', function() {
            select(this);

            const repoName = this.textContent;
            const selectedRepo = filteredRepos.find(repo => repo.name === repoName);
            
            if (selectedRepo) {
                createElement(selectedRepo);
                input.value = '';
            }
        })
    }
}


function select(element) {
    let selectUserData = element.textContent;
    input.value = selectUserData
    serchInput.classList.remove('active')
}

function createElement(element) {
    let div = document.createElement('div');
    div.classList.add('active-div');
    div.innerHTML = `<p><b>Name:</b> ${element.name}</p>
                     <p><b>Owner:</b> ${element.owner.login}</p>
                     <p><b>Stars:</b> ${element.stargazers_count}</p>`;

    let img = document.createElement('img');
    img.src = '/img/cross-svgrepo-com.svg';
    div.appendChild(img);

    results.appendChild(div);



    img.addEventListener('click', function () {
        div.innerHTML = '';
        div.classList.remove('active-div');
    })
}


input.addEventListener('keyup', fetchRepos)

input.addEventListener('focus', fetchRepos)

serchInput.addEventListener('keydown', function(event) {
    const items = menu.querySelectorAll('li');


    if(items.length === 0) return;

    switch(event.key) {
        case 'ArrowDown':
            event.preventDefault();
            currentFocus = currentFocus >= items.length - 1 ? 0 : currentFocus + 1;
            console.log(currentFocus)
            break;

        case 'ArrowUp':
            event.preventDefault();
            currentFocus = currentFocus <= 0 ? items.length - 1 : currentFocus - 1;
            console.log(currentFocus)
            break;
    }

    updateActiveElementBackground(items, currentFocus);
})


function updateActiveElementBackground(items, activeElement) {
    items.forEach(item => {
        item.style.backgroundColor = '#fff';
    });

    if (items[activeElement]) {
        items[activeElement].style.backgroundColor = '#efefef'; 
    }
}

window.addEventListener('click', function () {
    serchInput.classList.remove('active')
})


