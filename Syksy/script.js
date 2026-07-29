
async function lataaPysakit() {
    const response = await fetch('pysakit.csv');
    const data = await response.text();
    const rivit = data.trim().split('\n');

    const kontti = document.getElementById('pysakki-lista');
    kontti.innerHTML = '';

    let riviHtml = '';

    rivit.forEach((rivi, index) => {
        const osat = rivi.split(',');
        const nimi = osat[0];
        const koodi = osat[1];
        const status = osat[2] || 'aktiivinen';

        let merkinta = `${nimi} (${koodi})`;

        if (status === 'tilapäinen') {
            merkinta = `<span class="pysakki-tilapainen">${merkinta}</span>`;
        } else if (status === 'poistettu') {
            merkinta = `<span class="pysakki-poistettu">${merkinta}</span>`;
        }

        if (index < rivit.length - 1) {
            riviHtml += merkinta + ' | ';
        } else {
            riviHtml += merkinta;
        }
    });

    kontti.innerHTML = `<p>${riviHtml}</p>`;
}

async function lataaAikataulu(tiedosto, taulukkoId) {
    const response = await fetch(tiedosto);
    const data = await response.text();
    const csvRivit = data.trim().split('\n');

    const taulukko = document.getElementById(taulukkoId);
    taulukko.innerHTML = '';

    const maxCols = Math.max(...csvRivit.map(r => r.split(',').length));

    const thead = document.createElement('thead');
    const otsikkoRivi = document.createElement('tr');

    const tuntiTh = document.createElement('th');
    tuntiTh.textContent = 'Tunti';
    otsikkoRivi.appendChild(tuntiTh);

    const minuuttiTh = document.createElement('th');
    minuuttiTh.textContent = 'Minuutit';
    minuuttiTh.colSpan = maxCols - 1;
    otsikkoRivi.appendChild(minuuttiTh);

    thead.appendChild(otsikkoRivi);
    taulukko.appendChild(thead);

    const tbody = document.createElement('tbody');

    for (let i = 1; i < csvRivit.length; i++) {
        const sarakkeet = csvRivit[i].split(',');
        const tr = document.createElement('tr');

        const tuntiTd = document.createElement('td');
        tuntiTd.textContent = sarakkeet[0];
        tuntiTd.className = 'tunti-solu';
        tr.appendChild(tuntiTd);

        for (let j = 1; j < sarakkeet.length; j++) {
            const td = document.createElement('td');
            td.className = 'minuutti-solu';
            td.textContent = sarakkeet[j];
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }

    const nyt = new Date();
    const nykyinenTunti = nyt.getHours();
    const nykyinenMinuutti = nyt.getMinutes();

    const taulukkoRivit = tbody.querySelectorAll("tr");

    taulukkoRivit.forEach(rivi => {
        const tunti = parseInt(rivi.children[0].textContent);

        if (tunti === nykyinenTunti) {
            rivi.classList.add("nyt-tunti");

            let seuraava = null;

            for (let j = 1; j < rivi.children.length; j++) {
                const minuutti = parseInt(rivi.children[j].textContent);
                if (!isNaN(minuutti) && minuutti >= nykyinenMinuutti) {
                    seuraava = rivi.children[j];
                    break;
                }
            }

            if (seuraava) {
                seuraava.classList.add("nyt-lahto");
            }
        }
    });

    taulukko.appendChild(tbody);
}

window.addEventListener('DOMContentLoaded', () => {
    lataaAikataulu('aikataulu_mape.csv', 'arkipaivat-table');
    lataaAikataulu('aikataulu_la.csv', 'lauantai-table');
    lataaAikataulu('aikataulu_su.csv', 'sunnuntai-table');
    lataaPysakit();
});
