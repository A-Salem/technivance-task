// Sample test case that will be the same for all other apis

const expect = require('expect');
const request = require('supertest');
const randomstring = require("randomstring");

const { app } = require('./../main.js');


describe('POST /customers', () => {
  it('should create a new customer', (done) => {
    let email = randomstring.generate() + '@localhost.com';
    let first_name = randomstring.generate(7);
    let last_name = randomstring.generate(8);
    let store_credit = 600;
    let result = 'Customer added successfully';
    request(app)
      .post('/customers')
      .send({email, first_name, last_name, store_credit})
      .expect(200)
      .expect((res) => {
       expect(res.body.result).toBe('Customer added successfully');
      })
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it('should not create customer with invalid data', (done) => {
    request(app)
      .post('/customers')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err){
          return done(err);
        }
        done();
      });
  });
});
