import database from "infra/database.js";
import fs from 'fs/promises';
import { addUncaughtExceptionCaptureCallback } from "process";

beforeAll(cleanDatabase);

async function cleanDatabase() {
  await database.query('drop schema public cascade; create schema public');
}

test("Methods that are not iquals to GET or POST should return 405", async () => {
  const responseDelete = await fetch("http://localhost:3000/api/v1/migrations", {
    method: 'DELETE'
  })

  expect(responseDelete.status).toBe(405);

  const responsePatch = await fetch("http://localhost:3000/api/v1/migrations", {
    method: 'PATCH'
  })

  expect(responsePatch.status).toBe(405);

  const responsePut = await fetch("http://localhost:3000/api/v1/migrations", {
    method: 'PUT'
  })

  expect(responsePut.status).toBe(405);
});

test("Methods that are not iquals to GET or POST should return message 'Method Not Allowed'", async () => {
  const responseDelete = await fetch("http://localhost:3000/api/v1/migrations", {
    method: 'DELETE'
  })
  
  const responseBodyDelete = await responseDelete.json();
  expect(responseBodyDelete.message).toBe('Method DELETE Not Allowed');


  const responsePatch = await fetch("http://localhost:3000/api/v1/migrations", {
    method: 'PATCH'
  })

  const responseBodyPatch = await responsePatch.json();
  expect(responseBodyPatch.message).toBe('Method PATCH Not Allowed');


  const responsePut = await fetch("http://localhost:3000/api/v1/migrations", {
    method: 'PUT'
  })
  
  const responseBodyPut = await responsePut.json();
  expect(responseBodyPut.message).toBe('Method PUT Not Allowed');
});