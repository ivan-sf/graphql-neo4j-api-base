const { Neo4jGraphQL } = require("@neo4j/graphql");
const neo4j = require("neo4j-driver");
const { ApolloServer } = require("apollo-server");

const typeDefs = `
	INTROSPECT
	`;


const resolvers = {
	Query: {
	  companiesx: async (parent, args, context, info) => {
		const session = context.driver.session();
		const result = await session.run(
		  "MATCH (c:Company) RETURN c"
		);
		session.close();
		return result.records.map((record) => record.get("c").properties);
	  },
	},
  };
  

const driver = neo4j.driver('neo4j+s://localhost.neo4j.io', neo4j.auth.basic('neo4j', 'pw'));

const neoSchema = new Neo4jGraphQL({ typeDefs, driver, resolvers });

async function main() {
	const schema = await neoSchema.getSchema(resolvers);

	const server = new ApolloServer({
		schema,
		context: ({ req }) => ({
		  driver: driver, // Asegúrate de pasar la instancia correcta del driver al contexto
		}),
		introspection: true,
	  });
	  

	await server.listen(process.env.PORT || 4000);

	console.log("Online");
}

main()