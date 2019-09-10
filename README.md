# GrAMPS — Composable, Shareable Data Sources for GraphQL

[![Build Status](https://travis-ci.org/gramps-graphql/gramps.svg?branch=master)](https://travis-ci.org/gramps-graphql/gramps)

**An easier way to manage the data sources powering your GraphQL server.**

**GrAMPS** (short for **Gr**aphQL **A**pollo **M**icroservice **P**attern **S**erver) is a thin layer of helper tools designed for the [Apollo GraphQL server](https://github.com/apollographql/apollo-server/) that allows independent data sources — a schema, resolvers, and data access model — to be composed into a single GraphQL schema, while keeping the code within each data source isolated, independently testable, and completely decoupled from the rest of your application.

## Why Does GrAMPS Exist?

GrAMPS is an attempt to create a standard for organizing GraphQL data source repositories, which allows for multiple data sources to be composed together in a plugin-like architecture.

The ability to combine independently managed data sources into a single GraphQL server is a core requirement for IBM Cloud’s microservice architecture. We have dozens of teams who expose data, so a single codebase with all GraphQL data sources inside was not an option; we needed a way to give each team control of their data while still maintaining the ability to unify and expose our data layer under a single GraphQL microservice.

GrAMPS solves this problem by splitting each data source into independent packages that are composed together into a single GraphQL server.
