export const replaceSpecialChars = (value: string) => {
  if (!value) return value;

  let str = value?.toString();
  str = str?.replace(/[ÀÁÃÄÂ]/g, 'A');
  str = str?.replace(/[àáãâä]/g, 'a');
  str = str?.replace(/[ÈÉÊË]/g, 'E');
  str = str?.replace(/[èéêë]/g, 'e');
  str = str?.replace(/[ÌÍÎÏ]/g, 'I');
  str = str?.replace(/[ìíîï]/g, 'i');
  str = str?.replace(/[ÒÓÔÕÖ]/g, 'O');
  str = str?.replace(/[òóôõö]/g, 'o');
  str = str?.replace(/[ÙÚÛŨÜ]/g, 'U');
  str = str?.replace(/[ùúûũü]/g, 'u');
  str = str?.replace(/[Ç]/g, 'C');
  str = str?.replace(/[ç]/g, 'c');

  return str;
};

export const genderWords = [{ name: 'professor', variant: 'professora' }];

export const strToLettersArr = (str) => {
    if (!str) return [];

    return replaceSpecialChars(str?.toLowerCase())
        .split(' ')
        .join('')
        .split('');
};

const getSequenceMetaData = (
    sequenceData,
    searchLetters,
    nameCategoryLetters
) => {
    for (let j = 0; j < searchLetters.length; j++) {
        const letter = searchLetters[j];
        // current search letter index at category name
        let letterIndex = nameCategoryLetters.indexOf(letter);

        // letter index is equal the next index in sequence
        const isNextIndex = sequenceData.lastIndex + 1 === letterIndex;
        // search letter is equal the next letter in sequence
        const isNextLetter =
            letter === nameCategoryLetters[sequenceData.lastIndex + 1];

        if (isNextIndex || isNextLetter) {
            sequenceData.current += 1;

            // updates index against current sequence
            if (isNextLetter) letterIndex = sequenceData.lastIndex + 1;
        } else {
            // starts the current sequence at 1 or 0 depending on the match between letters at the same index
            sequenceData.current =
                letter === nameCategoryLetters[letterIndex] ? 1 : 0;
        }

        // current sequence is greater than previous max sequence
        if (sequenceData.current > sequenceData.max) {
            // update maximum sequence
            sequenceData.max = sequenceData.current;

            // calculate index start of maximum sequence
            sequenceData.startMax = letterIndex + 1 - sequenceData.current;

            // update max sequence interval
            sequenceData.interval = [sequenceData.startMax, letterIndex + 1];
        }

        // update last index found
        sequenceData.lastIndex = letterIndex;

        // if letter exists in category name then add in match letters array
        if (letterIndex > -1) sequenceData.matchLetters.push(letter);
    }
};

export const searchMatchCategories = (
    search: string,
    categories: Array<string>,
    minPercent = 30
) => {
    // transform search term in an array of letters
    const searchLetters = strToLettersArr(search);

    // categories found after filtering
    const foundCategories = [];

    const hasVariant = genderWords.find(
        (gw) => searchLetters.join('').indexOf(gw.variant) !== -1
    );

    // iterate over all filtered categories
    for (let i = 0; i < categories.length; i++) {
        // category name
        const Name  = categories[i];

        // transform category name in an array of letters
        const nameCategoryLetters = strToLettersArr(Name);

        // object to control sequence metadata
        const sequenceData = {
            // max sequence reached
            max: 0,
            // start of max sequence
            startMax: 0,
            // interval between max sequence indexes [indexStart, indexEnd]
            interval: [],
            // current matches in sequence
            current: 0,
            // last matched letter index at category name
            lastIndex: null,
            // search term letters that exists in category name
            matchLetters: []
        };

        const hasGender = hasVariant
            ? genderWords.find(
                  (gw) => nameCategoryLetters.join('').indexOf(gw.name) !== -1
              )
            : null;

        // check if search term is inside category name sequentially
        let indexInside = -1;

        if (hasGender) {
            indexInside = nameCategoryLetters
                .join('')
                .indexOf(
                    searchLetters
                        .join('')
                        .replace(hasGender.variant, hasGender.name)
                );
        } else {
            indexInside = nameCategoryLetters
                .join('')
                .indexOf(searchLetters.join(''));
        }

        // search term is inside category name
        if (indexInside > -1) {
            sequenceData.max = searchLetters.length;
            sequenceData.startMax = indexInside;
            sequenceData.interval = [
                indexInside,
                indexInside + searchLetters.length
            ];
            sequenceData.matchLetters = searchLetters;
        } else {
            // iterate over all search term letters
            getSequenceMetaData(
                sequenceData,
                searchLetters,
                nameCategoryLetters
            );
        }

        // match percentage is calculated by checking how many letters of the search term there are within the category name
        const percent =
            (sequenceData.matchLetters.length / searchLetters.length) * 100 ||
            0;

        // add category if match percentage is greater than min percentage given in params
        if (percent >= minPercent) {
            foundCategories.push({
                Name,
                Match: sequenceData.max,
                Equal: hasGender
                    ? nameCategoryLetters
                          .join('')
                          .replace(hasGender.name, hasGender.variant) ===
                      searchLetters.join('')
                    : nameCategoryLetters.join('') === searchLetters.join(''),
                Start: sequenceData.startMax,
                Interval: sequenceData.interval,
                Percent: percent
            });
        }
    }

    // return categories sorted
    return foundCategories.sort((a, b) => {
        // prioritize equal categories
        if (a.Equal && !b.Equal) {
            return -1;
        } else if (!a.Equal && b.Equal) {
            return 1;
        }

        // prioritize greater percent
        if (a.Match > b.Match) {
            return -1;
        }

        // equal percent match
        if (a.Match === b.Match) {
            // prioritize smallest start
            if (a.Start < b.Start) return -1;
            // alphabetical order sorting
            else if (a.Start === b.Start)
                return replaceSpecialChars(
                    a?.Name?.toLowerCase()
                ).localeCompare(replaceSpecialChars(b?.Name?.toLowerCase()));
        }

        return 1;
    });
};

export const fillSpecialties = ({ search, categories, specialties }) => {
    const equals = categories.filter((c) => c.Equal);
    let rest = [];

    if (equals.length) {
        rest = equals.reduce((ac, v) => {
            const relations = specialties.filter(
                (s) => s.Relations?.some((r) => String(r) === String(v._id))
            );

            relations.forEach((s) => {
                ac.push({
                    ...v,
                    Name: v.Name + ' ' + s.Name,
                    Specialty: s
                });
            }, []);

            return ac;
        }, []);

        const find = replaceSpecialChars(search?.toLowerCase());

        if (equals.length > 1) {
            const display = equals
                .sort(
                    (a, b) =>
                        find.indexOf(
                            replaceSpecialChars(a?.Name?.toLowerCase())
                        ) -
                        find.indexOf(
                            replaceSpecialChars(b?.Name?.toLowerCase())
                        )
                )
                .slice(0, 2);

            rest.push({
                ...display[0],
                Name: display[0].Name + ' ' + display[1].Name,
                Sub: display[1]
            });
        }
    }

    return searchMatchCategories(search, [...categories, ...rest]);
};

export const subSrtIntervals = (term, category) => {
    term = replaceSpecialChars(term?.toLowerCase());
    category = replaceSpecialChars(category?.toLowerCase());

    // split category in words
    const words = category.split(' ');
    // intervals of matches
    const subIntervals = [];

    // interate for each word
    for (let i = 0; i < words.length; i++) {
        const word = replaceSpecialChars(words[i]);

        // word has term inside
        const isTermInWord = term.indexOf(word) > -1;

        const startIndex = i === 0 ? 0 : words.slice(0, i).join(' ').length + 1;

        if (isTermInWord) {
            const finalIndex = startIndex + word.length;

            subIntervals.push([startIndex, finalIndex + 1, true]);

            continue;
        }

        const sequenceData = {
            max: 0,
            startMax: 0,
            interval: [],
            current: 0,
            lastIndex: null,
            matchLetters: []
        };

        getSequenceMetaData(sequenceData, term.split(''), word.split(''));

        if (sequenceData.max > 1) {
            const start = startIndex + sequenceData.startMax;
            const finish =
                startIndex + sequenceData.startMax + sequenceData.max;

            if (start > startIndex)
                subIntervals.push([startIndex, start, false]);

            subIntervals.push([start, finish, true]);

            if (finish < startIndex + word.length)
                subIntervals.push([
                    finish,
                    startIndex + word.length + 1,
                    false
                ]);
            else subIntervals[subIntervals.length - 1][1] = finish + 1;
        } else {
            subIntervals.push([
                startIndex,
                startIndex + word.length + 1,
                false
            ]);
        }
    }

    return subIntervals;
};

// get all descending categories
export const getChildCategories = (
    categories: Array<CategoryDTO>,
    categoryID: string
) => {
    let childs = categories.filter(
        (c) => String(c.ParentID) === String(categoryID)
    );

    let lastChilds = childs;

    let continueSearch = !!lastChilds.length;

    while (continueSearch) {
        lastChilds = categories.filter(
            (c) =>
                lastChilds
                    .map((lc) => String(lc._id))
                    .indexOf(String(c.ParentID)) > -1
        );

        if (lastChilds.length) {
            childs = childs.concat(lastChilds);
        } else continueSearch = false;
    }

    return childs;
};
