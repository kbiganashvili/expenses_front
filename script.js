const link = 'http://localhost:8080/expenses';

const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

const withBody = async (method, body, id) => {
    const finalLink = id ? `${link}/${id}` : link;
    return fetch(finalLink, {
        method,
        headers,
        body: JSON.stringify(body),
    });
};

const withoutBody = async (method, id) => {
    const finalLink = id ? `${link}/${id}` : link;
    return fetch(finalLink, {
        method,
        headers,
    });
};

const sample = (item) => {
    const container = document.getElementById('expensesContainer');
    container.innerHTML = '';
    let sumOfExpenses = 0;

    item.forEach((element) => {
        const { id, name, cost, updatedAt } = element;
        sumOfExpenses += Number(cost);

        const sum = document.getElementById('sum');

        const listItem = document.createElement('li');
        const attributes = document.createElement('ul');
        const storeName = document.createElement('li');
        const storeNameEdit = document.createElement('li');
        const storeNameEditField = document.createElement('input');
        const date = document.createElement('li');
        const spent = document.createElement('li');
        const spentAmountEdit = document.createElement('li');
        const spentAmountEditField = document.createElement('input');
        const secondContainer = document.createElement('div');
        const iconContainer = document.createElement('div');
        const spentSpan = document.createElement('span');

        const editButtons = document.createElement('li');
        const editIcon = document.createElement('i');

        const deleteButtons = document.createElement('li');
        const deleteIcon = document.createElement('i');

        const confirmButtons = document.createElement('li');
        const confirmIcon = document.createElement('i');

        editButtons.className = 'edit-button';
        deleteButtons.className = 'delete-button';
        confirmButtons.className = 'confirm-button';
        date.className = 'date-field';
        spent.className = 'spent-field';
        spentSpan.className = 'spent-span-field';
        storeName.className = 'name-field';
        iconContainer.className = 'icon-container';

        confirmIcon.className = `fa-solid fa-check`;
        editIcon.className = 'fa-solid fa-pen';
        deleteIcon.className = 'fa-solid fa-trash';
        attributes.className = `item`;

        storeNameEdit.className = 'name-edit';
        spentAmountEdit.className = 'amount-edit';
        secondContainer.className = 'second-container';
        spentAmountEditField.type = 'number';

        storeNameEditField.style.width = '200px';
        spentAmountEditField.style.width = '100px';

        storeName.innerText = name;
        date.innerText = updatedAt;
        spent.innerText = '$';
        spentSpan.innerText = `${Number(cost).toFixed(2)}`;
        sum.innerText = `Sum: $${sumOfExpenses}`;

        editButtons.append(editIcon);
        editIcon.id = id;

        editIcon.addEventListener('click', ({ target }) => {
            const editElReference = {
                confirmButtons,
                target,
                storeName,
                spent,
                spentSpan,
                storeNameEditField,
                spentAmountEditField,
            };

            // eslint-disable-next-line no-use-before-define
            editExpenseById(editElReference);
        });

        deleteButtons.append(deleteIcon);
        // eslint-disable-next-line no-use-before-define
        deleteButtons.addEventListener('click', () => deleteExpenseById(id));

        confirmButtons.append(confirmIcon);

        confirmIcon.addEventListener('click', () => {
            const confirmElReference = {
                storeName,
                spentSpan,
                storeNameEditField,
                spentAmountEditField,
                id,
            };

            // eslint-disable-next-line no-use-before-define
            confirmEditById(confirmElReference);
        });

        iconContainer.append(confirmButtons, editButtons, deleteButtons);
        spent.append(spentSpan);
        secondContainer.append(date, spent, spentAmountEdit, iconContainer);

        attributes.append(storeName, storeNameEdit, secondContainer);
        storeNameEdit.append(storeNameEditField);
        spentAmountEdit.append(spentAmountEditField);
        listItem.append(attributes);
        container.append(listItem);
    });
};

const createExpense = async () => {
    const spentWhere = document.getElementById('spentWhereInput');
    const spentAmount = document.getElementById('howMuchSpentInput');
    const errors = document.getElementById('error-text');
    errors.innerHTML = '';
    const errorsArray = [];

    if (!spentWhere.value) {
        errorsArray.push('Name Must Not Be Empty!');
    }
    if (Number.isNaN(spentAmount.value) || !spentAmount.value) {
        errorsArray.push('Spent Amount Must Be A Number!');
    }

    if (errorsArray.length) {
        errors.style.display = 'block';
        errorsArray.forEach((element) => {
            errors.innerHTML += `<li>${element}</li>`;
        });
    } else {
        try {
            const result = await withBody('POST', {
                name: spentWhere.value,
                cost: Number(spentAmount.value),
            });

            const res = await result.json();
            sample(res);

            spentWhere.value = '';
            spentAmount.value = '';
        } catch (error) {
            errors.style.display = 'block';
            errors.innerHTML = `<li>${error}</li>`;
        }
    }
};

const editExpenseById = async (editElReference) => {
    const {
        confirmButtons,
        target,
        storeName,
        spent,
        spentSpan,
        storeNameEditField,
        spentAmountEditField,
    } = editElReference;

    const oldNameValue = storeName.innerText;
    storeNameEditField.value = oldNameValue;
    const oldSpentValue = Number(spentSpan.innerText);
    spentAmountEditField.value = oldSpentValue;

    storeName.style.display = 'none';
    storeNameEditField.parentElement.style.display = 'block';
    spent.style.display = 'none';
    spentAmountEditField.parentElement.style.display = 'block';
    target.style.display = 'none';
    confirmButtons.style.display = 'block';
};

const confirmEditById = async (confirmElReference) => {
    const { storeName, spentSpan, storeNameEditField, spentAmountEditField, id } = confirmElReference;

    const errors = document.getElementById('error-text');

    const name = storeNameEditField.value;
    const cost = Number(spentAmountEditField.value);

    const errorsArray = [];

    errors.innerHTML = '';

    if (!name) errorsArray.push('Name Must Not Be Empty!');
    if (!cost) errorsArray.push('Amount Must Not Be Empty!');
    if (Number.isNaN(cost)) errorsArray.push('Amount Must Be a Number!');
    if (name === storeName.innerText && cost === Number(spentSpan.innerText)) errorsArray.push('You Must Change At Least One Field!');
    if (errorsArray.length) {
        errors.style.display = 'block';
        errorsArray.forEach((element) => {
            errors.innerHTML += `<li>${element}</li>`;
        });
    } else if (id) {
        try {
            const result = await withBody('PATCH', { name, cost }, id);

            const res = await result.json();
            sample(res);
        } catch (error) {
            errors.innerHTML = `<li>${error}</li>`;
        }
    } else {
        errors.innerHTML = '<li>ID Does Not Exist!</li>';
    }
};

const deleteExpenseById = async (id) => {
    try {
        if (id) {
            const result = await withoutBody('DELETE', id);

            const res = await result.json();
            sample(res);
        } else {
            const error = document.getElementById('error-text');
            error.innerText = 'ID Does Not Exist!';
        }
    } catch (error) {
        document.getElementById('error-text').style.display = 'block';
        document.getElementById('error-text').innerText = error;
    }
};

const render = async () => {
    const addButton = document.getElementById('addBtn');
    addButton.addEventListener('click', createExpense);

    const url = await withoutBody('GET');
    const item = await url.json();

    if (item.length) {
        sample(item);
    } else {
        document.getElementById('error-text').style.display = 'block';
        document.getElementById('error-text').innerText =
            'There are no expense records';
        document.getElementById('sum').innerText = 'Sum: $0';
        sample(item);
    }
};

window.onload = () => {
    render();
};
