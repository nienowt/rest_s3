'use strict';

const chai = require('chai');
const chaiHTTP = require('chai-http');
chai.use(chaiHTTP);
const request = chai.request;
const expect = chai.expect;
let User = require(__dirname + '/../models/users-model');
require(__dirname + '/../server');

describe('http server', () => {
  let userId;
  before((done) => {
    request('localhost:3000')
    .post('/users')
    .send({'name':'Todd'})
    .end(done());
  });
  after((done) => {
    User.remove({}, (err) => {
      if (err) console.log(err);
      console.log('users cleared');
      done();
    });
  });
  it(' should respond to "get" on /users with list of users', (done) => {
    request('localhost:3000')
    .get('/users')
    .end((err, res) => {
      expect(err).to.eql(null);
      expect(res.body[0].name).to.eql('Todd');
      done();
    });
  });
  it('should respond "post" on /users with new user', (done) => {
    request('localhost:3000')
    .post('/users')
    .send({'name':'Sally'})
    .end((err, res) => {
      expect(err).to.eql(null);
      expect(res.body.name).to.eql('Sally');
      userId = res.body._id;
      done();
    });
  });
  it('should respond to "get" on /users/:user with specified user', (done) => {
    request('localhost:3000')
    .get('/users/' + userId)
    .end((err, res) => {
      expect(err).to.eql(null);
      expect(res.body.name).to.eql('Sally');
      done();
    });
  });
  it('should respond to "put" on /users/:user with change success', (done) => {
    request('localhost:3000')
    .put('/users/' + userId)
    .send({'name':'George'})
    .end((err, res) => {
      expect(err).to.eql(null);
      expect(res.text).to.eql('User Updated');
      done();
    });
  });
  it('should post new file ', (done) => {
    request('localhost:3000')
    .post('/users/' + userId + '/files')
    .send({'name':'ugh','fileName':'testFile', 'content':'test content'})
    .set('Content-Type', 'application/json')
    .end((err, res) => {
      expect(err).to.eql(null);
      expect(res.text).to.eql('file uploaded');
      done();
    });
  });
  it('should respond to "delete" on /users/:user with delete notification', (done) => {
    request('localhost:3000')
    .del('/users/' + userId)
    .end((err, res) => {
      expect(err).to.eql(null);
      expect(res.text).to.eql('User Deleted');
      done();
    });
  });
});

describe('/files/:files', () => {
  let fileId;
  let userId2;
  before((done) => {
    request('localhost:3000')
    .post('/users')
    .send({'name':'Radish'})
    .end((err, res) => {
      userId2 = res.body._id;
      done();
    });
  });
  before((done) => {
    request('localhost:3000')
    .post('/users/' + userId2 + '/files')
    .send({'name':'ugh','fileName':'testFile', 'content':'test content'})
    .end(() => {
      done();
    });
  });
  before((done) => {
    request('localhost:3000')
    .get('/users/' + userId2)
    .end((err, res) => {
      fileId = res.body.files[0]._id;
      done();
    });
  });
  it('should respond to get reqs with the specified file',(done) =>{
    request('localhost:3000')
    .get('/files/' + fileId)
    .end((err, res) => {
      expect(err).to.eql(null);
      expect(res.body.name).to.eql('testFile');
      done();
    });
  });
  after((done) => {
    request('localhost:3000')
      .del('/users/' + userId2)
      .end((err, res) => {
        expect(err).to.eql(null);
        expect(res.text).to.eql('User Deleted');
        done();
      });
  });
});
