const { Pool, Client, connect } = require('./../main.js');

let submitOrder = async (req, res) => {
  let reqBody = req.body;
  let result, total_price, new_credit;

  const client = new Client({
    connectionString: connect
  });

  await client.connect();

  try {
    let customer_cart = await client.query('SELECT * FROM carts WHERE customer_id=$1', [reqBody.customer_id]);
    if (!customer_cart.rows.length) {
      return res.send({result: `Can't make order as customer's cart is empty`});
    } else {
      let total = await client.query(`SELECT cartItem.customer_id, SUM(cartItem.quantity * item.price) FROM carts cartItem
        JOIN items item ON item.id = cartItem.item_id WHERE cartItem.customer_id = $1
        GROUP BY cartItem.customer_id`, [reqBody.customer_id]);
      if (total) {
        total_price = total.rows[0].sum;

        // Check that customer credit covers price and if yes update add order and update customer's credit
        let customer = await client.query('SELECT * FROM customers WHERE id=$1', [reqBody.customer_id]);
        if (customer && customer.rows.length) {

          let customer_credit = customer.rows[0].store_credit;
          if (customer_credit > total_price) {

            // Add Order
            let add_order = await client.query('INSERT INTO orders(customer_id, total, address, telephone) VALUES($1, $2, $3, $4)',
                [reqBody.customer_id, total_price, reqBody.address, reqBody.telephone]);

            // Update Customer Credit
            new_credit = customer_credit - total_price;
            let update_credit = await client.query('UPDATE customers SET store_credit=$1 WHERE id=$2',
                [new_credit, reqBody.customer_id]);

            // Remove Customer Items From Cart as Order done successfully
            let remove_cart_items = await client.query('DELETE FROM carts WHERE customer_id=$1', [reqBody.customer_id]);

          } else {
            return res.status(400).send(`Customer's credit not enough to cover his cart items`);
          }

        } else {
          return res.status(400).send('Customer not found');
        }

      }

    }

  } catch(e) {
    return res.status(400).send(e);
  }
  return res.send({result: 'Order submitted successfully', new_credit});
  await client.end();
};


let listCustomerOrders = async (req, res) => {
  let result;

  const client = new Client({
    connectionString: connect
  });

  let reqHeaders = req.headers;
  let queryString = 'SELECT * FROM orders WHERE customer_id=$1';

  let page = reqHeaders.page, items_per_page = reqHeaders.items_per_page;

  await client.connect();

  if (page) {
    let offset = (page - 1) * items_per_page;
    queryString = `SELECT * FROM orders WHERE customer_id=$1 ORDER BY id LIMIT ${items_per_page} OFFSET ${offset}`;
  }

  try {
    result = await client.query(queryString, [reqHeaders.customer_id]);
  } catch (e) {
    res.status(400).send(e);
  }
  res.send({items: result.rows});
  await client.end();
};

module.exports = {
  submitOrder,
  listCustomerOrders
}
