---
title: 'Intro'
position: 1
---

When building applications that handle highly sensitive user data, protecting data in transit and at rest on the server is often not enough. If your server is compromised, or if a malicious actor gains access to your database, your users' data is exposed.

The ultimate solution to this vulnerability is a Zero-Knowledge Architecture. In this model, the server acts as a blind storage engine. Data is encrypted on the client device before it is ever transmitted, and the keys required for decryption never leave the user's browser.

Achieving this securely in a web browser requires a deliberate combination of cryptography, state management and lifecycle handling, all centered purely around data protection rather than identity management.
