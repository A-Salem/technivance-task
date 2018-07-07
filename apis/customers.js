const { Pool, Client, connect } = require('./../main.js');

let addCustomer = async (req, res) => {
  let reqBody = req.body;
  let result;

  const client = new Client({
    connectionString: connect
  });

  await client.connect();

  let sameCustomer = await client.query('SELECT * FROM customers WHERE email=$1', [reqBody.email]);

  if(sameCustomer.rows.length)
    return res.status(400).send({error: 'This customer already exists'});

  try {
    result = await client.query('INSERT INTO customers(email, first_name, last_name, store_credit) VALUES($1, $2, $3, $4)',
        [reqBody.email, reqBody.first_name, reqBody.last_name, reqBody.store_credit]);
  } catch(e) {
    return res.status(400).send(e);
  }

  if(result)
    res.send({result: 'Customer added successfully'});

  await client.end();
};


let listCustomers = async (req, res) => {
  let result;

  const client = new Client({
    connectionString: connect
  });

  await client.connect();

  try {
    result = await client.query('SELECT * FROM customers');
  } catch (e) {
    res.status(400).send(e);
  }

  res.send({customers: result.rows});
  await client.end();
};


let deleteCustomer = async (req, res) => {
  let customerId = req.params.id;
  let result;

  const client = new Client({
    connectionString: connect
  });

  await client.connect();

  let customer = await client.query('SELECT * FROM customers WHERE id=$1', [customerId]);

  if(!customer.rows.length)
    return res.status(400).send({error: 'Customer not found'});

  try {
    result = await client.query('DELETE FROM customers WHERE id=$1', [customerId]);
  } catch (e) {
    res.status(400).send(e);
  }

  if(result)
    res.send({result: 'Customer removed successfully'});

  await client.end();
};


module.exports = {
  addCustomer,
  listCustomers,
  deleteCustomer
}
