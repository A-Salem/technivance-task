const { Pool, Client, connect } = require('./../main.js');

let addItem = async (req, res) => {
  let reqBody = req.body;
  let result;

  const client = new Client({
    connectionString: connect
  });

  await client.connect();

  let sameItem = await client.query('SELECT * FROM items WHERE name=$1', [reqBody.name]);

  if(sameItem.rows.length)
    return res.status(400).send({error: 'This item already exists'});

  try {
    result = await client.query('INSERT INTO items(name, description, price) VALUES($1, $2, $3)',
        [reqBody.name, reqBody.description, reqBody.price]);
  } catch(e) {
    return res.status(400).send(e);
  }

  if(result)
    res.send({result: 'Item added successfully'});

  await client.end();
};


let listItems = async (req, res) => {
  let result;

  const client = new Client({
    connectionString: connect
  });

  let reqHeaders = req.headers;
  let queryString = 'SELECT * FROM items';

  let page = reqHeaders.page, items_per_page = reqHeaders.items_per_page;

  await client.connect();

  if (page) {
    let offset = (page - 1) * items_per_page;
    queryString = `SELECT * FROM items ORDER BY id LIMIT ${items_per_page} OFFSET ${offset}`;
  }

  try {
    result = await client.query(queryString);
  } catch (e) {
    res.status(400).send(e);
  }
  res.send({items: result.rows});
  await client.end();
};


let deleteItem = async (req, res) => {
  let itemId = req.params.id;
  let result;

  const client = new Client({
    connectionString: connect
  });

  await client.connect();

  let item = await client.query('SELECT * FROM items WHERE id=$1', [itemId]);

  if(!item.rows.length)
    return res.status(400).send({error: 'Item not found'});

  try {
    result = await client.query('DELETE FROM items WHERE id=$1', [itemId]);
  } catch (e) {
    res.status(400).send(e);
  }

  if(result)
    res.send({result: 'Item removed successfully'});

  await client.end();
};


module.exports = {
  addItem,
  listItems,
  deleteItem
}
