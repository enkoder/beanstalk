"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUser = exports.GetUsers = exports.GetUser = void 0;
const schema_1 = require("../schema");
const itty_router_1 = require("itty-router");
const drizzle_orm_1 = require("drizzle-orm");
const itty_router_openapi_1 = require("@cloudflare/itty-router-openapi");
const User = {
  id: new itty_router_openapi_1.Int({ required: true }),
  name: new itty_router_openapi_1.Str({ required: true }),
  email: new itty_router_openapi_1.Str({ required: true }),
};
class GetUser extends itty_router_openapi_1.OpenAPIRoute {
  handle(req, env, context) {
    return __awaiter(this, void 0, void 0, function* () {
      const result = yield req.db
        .select()
        .from(schema_1.users)
        .where(
          (0, drizzle_orm_1.eq)(
            schema_1.users.id,
            Number(req.params["userID"]),
          ),
        )
        .get();
      return (0, itty_router_1.json)(result);
    });
  }
}
exports.GetUser = GetUser;
GetUser.schema = {
  tags: ["User"],
  summary: "Gets a single user",
  parameters: {
    userID: (0, itty_router_openapi_1.Path)(itty_router_openapi_1.Int, {
      description: "User ID (integer)",
    }),
  },
  responses: {
    200: {
      description: "User Object",
      schema: {
        user: User,
      },
    },
  },
};
class GetUsers extends itty_router_openapi_1.OpenAPIRoute {
  handle(req, env, context) {
    return __awaiter(this, void 0, void 0, function* () {
      const query = req.db.select().from(schema_1.users);
      console.log(query.toSQL());
      const result = yield query.all();
      return (0, itty_router_1.json)(result);
    });
  }
}
exports.GetUsers = GetUsers;
GetUsers.schema = {
  tags: ["User"],
  summary: "Gets a list of all users",
  responses: {
    200: {
      description: "List of all users",
      schema: {
        user: [User],
      },
    },
  },
};
class CreateUser extends itty_router_openapi_1.OpenAPIRoute {
  handle(req) {
    return __awaiter(this, void 0, void 0, function* () {
      const body = yield req.json();
      const res = yield req.db
        .insert(schema_1.users)
        .values({ email: body.email, name: body.email })
        .returning()
        .get();
      return (0, itty_router_1.json)({ res });
    });
  }
}
exports.CreateUser = CreateUser;
CreateUser.schema = {
  tags: ["User"],
  summary: "Creates a user",
  responses: {
    200: {
      description: "List of User objects",
      schema: {
        user: [User],
      },
    },
  },
};
