export const tweetSchema = {
    name: "tweets",
    type: "document",
    title: "Tweets",
    fields: [
        {
            name: "tweet",
            type: "string",
            title: "Tweet",
        },
        {
            name: "timestamp",
            type: "datetime",
            title: "Timestamp",
        },
        {
            name: "author",
            type: "reference",
            title: "Author",
            to: [{ type: "users" }],
        },
    ],
};
