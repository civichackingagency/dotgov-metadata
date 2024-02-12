const getGrade = score => {
    if (score >= 90)
        return 'A';
    if (score >= 80)
        return 'B';
    if (score >= 70)
        return 'C';
    if (score >= 60)
        return 'D';
    return 'F';
};

const showChangelog = (data, changesToShow, domainsPerChange) => {
    let changes = new Map();
    for (let i = 0; i < data.length; i++) {
        if (data[i].status != 200 || !data[i].redirect.includes(data[i].url))
            continue;

        for (let j = 0; j < data[i].history.length; j++) {
            const newData = (j == data[i].history.length - 1 ?
                data[i] :
                data[i].history[j + 1]), oldData = data[i].history[j];
            if (newData.status != 200)
                continue;

            let oldTotal = 0, newTotal = 0;
            for (let k = 0; k < variables.length; k++) {
                if (oldData[variables[k]])
                    oldTotal++;
                if (newData[variables[k]])
                    newTotal++;
            }
            if (oldTotal == newTotal)
                continue;

            let date = new Date(oldData.time);
            date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            const item = {
                url: data[i].url,
                old: oldTotal,
                new: newTotal
            };
            if (changes.has(date))
                changes.set(date, changes.get(date).concat(item));
            else
                changes.set(date, [item]);
        }
    }
    for (const entry of changes.entries())
        changes.set(entry[0], entry[1].sort((a, b) => (b.new - b.old) - (a.new - a.old)))
    const timeline = document.getElementById('timeline');
    changes = [...changes.entries()].sort((a, b) => new Date(b[0]) - new Date(a[0]));
    if (changesToShow)
        changes = changes.slice(0, changesToShow);
    for (const change of changes) {
        document.getElementById('changelog').style.display = 'initial';
        const li = document.createElement('li');
        li.classList.add('timeline-item');
        li.innerHTML = `
                <h5 class="fw-bold">${change[0]}</h5>
                <div class="text-muted">
                ${(domainsPerChange ? change[1].slice(0, domainsPerChange) : change[1]).map(domain => {
            const oldGrade = Math.round(domain.old / variables.length * 100);
            const newGrade = Math.round(domain.new / variables.length * 100);
            return `
                        <p style="margin-bottom: 0.25rem;">
                            ${domain.url} / Grade: ${getGrade(oldGrade)} → ${getGrade(newGrade)} / Score: ${oldGrade}% → ${newGrade}% (${domain.old} → ${domain.new} of ${variables.length} tags)
                            <a href="profile.html?domain=${domain.url}" aria-label="View report"><svg class="svg-inline--fa fa-file-lines" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-lines" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><!--! Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2023 Fonticons, Inc. --><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg></a>
                        </p>`;
        }).join('')}
            </div>
            ${change !== changes[changes.length - 1] ? '<br>' : ''}
            </li>
        `;
        timeline.appendChild(li);
    }
};