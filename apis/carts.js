const { Pool, Client, connect } = require('./../main.js');

let addToCart = async (req, res) => {
  let reqBody = req.body;
  let result;

  const client = new Client({
    connectionString: connect
  });

  await client.connect();

  let sameItemInCart = await client.query('SELECT * FROM carts WHERE item_id=$1 AND customer_id=$2',
    [reqBody.item_id, reqBody.customer_id]);

  if(sameItemInCart.rows.length)
    return res.status(400).send({error: 'This item already exists in the cart'});

  try {
    result = await client.query('INSERT INTO carts(customer_id, item_id, quantity) VALUES($1, $2, $3)',
        [reqBody.customer_id, reqBody.item_id, reqBody.quantity]);
  } catch(e) {
    return res.status(400).send(e);
  }

  if(result)
    res.send({result: 'Item added to cart successfully'});

  await client.end();
};


let editCart = async (req, res) => {
  let reqBody = req.body;
  let result;

  const client = new Client({
    connectionString: connect
  })

  await client.connect();

  let cart = await client.query('SELECT * FROM carts WHERE id=$1', [reqBody.cart_id]);

  if(!cart.rows.length)
    return res.status(400).send({error: 'Item not found in cart'});


  try {
    result = await client.query('UPDATE carts SET quantity=$1 WHERE id=$2',
        [reqBody.new_quantity, reqBody.cart_id]);
  } catch(e) {
    return res.status(400).send(e);
  }

  if(result)
    res.send({result: 'Cart Item updated successfully'});
  await client.end();
};


let deleteCartItem = async (req, res) => {
  let cartId = req.params.id;
  let result;

  const client = new Client({
    connectionString: connect
  });

  await client.connect();

  let cart = await client.query('SELECT * FROM carts WHERE id=$1', [cartId]);

  if(!cart.rows.length)
    return res.status(400).send({error: 'Item not found in cart'});

  try {
    result = await client.query('DELETE FROM carts WHERE id=$1', [cartId]);
  } catch (e) {
    res.status(400).send(e);
  }

  if(result)
    res.send({result: 'Item removed from cart successfully'});

  await client.end();
};


let getCustomerCart = async (req, res) => {
  let customer_id = req.params.customer_id;
  let result, total, total_price = 0;

  const client = new Client({
    connectionString: connect
  });

  await client.connect();

  try {
    result = await client.query('SELECT * FROM carts WHERE customer_id=$1', [customer_id]);
  } catch(e) {
    return res.status(400).send(e);
  }

  if (result.rows.length) {
    try {
      total = await client.query(`SELECT cartItem.customer_id, SUM(cartItem.quantity * item.price) FROM carts cartItem
        JOIN items item ON item.id = cartItem.item_id WHERE cartItem.customer_id = $1
        GROUP BY cartItem.customer_id`, [customer_id]);
    } catch(e) {
      return res.status(400).send(e);
    }
    total_price = total.rows[0].sum;
  }

  res.send({items: result.rows, total_price});
  await client.end();
};


module.exports = {
  addToCart,
  editCart,
  deleteCartItem,
  getCustomerCart
}
