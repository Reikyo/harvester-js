const axios = require('axios');
const {Parser} = require('htmlparser2');
const {Handler} = require('htmlmetaparser');

// -------------------------------------------------------------------------------------------------

const catalogueCollectionUrl = 'https://openactive.io/data-catalogs/data-catalog-collection.jsonld';

// -------------------------------------------------------------------------------------------------

// async/await does not seem necessary here for final output ...
const get_catalogue_urls = async (catalogueCollectionUrl) => {
    let catalogueUrls =
        await
        axios
        .get(catalogueCollectionUrl)
        .then(catalogueCollection => catalogueCollection.data.hasPart)
        .catch(err => {
            console.log(`ERROR: Can\'t get collection of catalogues: ` + err.message);
            return [];
        });
    return catalogueUrls;
};

// -------------------------------------------------------------------------------------------------

// async/await does not seem necessary here for final output ...
const get_dataset_urls_all = async (catalogueUrls) => {
    let datasetUrlsAll =
        await
        axios
        .all(catalogueUrls.map(async catalogueUrl => ({
            [catalogueUrl]: await get_dataset_urls_for_catalogue_url(catalogueUrl) // async/await is necessary here for final output
        })))
        .then(x => Object.assign({}, ...x));
    return datasetUrlsAll;
};

// -------------------------------------------------------------------------------------------------

// async/await does not seem necessary here for final output ...
const get_dataset_urls_for_catalogue_url = async (catalogueUrl) => {
    let datasetUrlsForCatalogueUrl =
        await
        axios
        .get(catalogueUrl)
        .then(catalogue => catalogue.data.dataset)
        .catch(err => {
            console.log(`ERROR: Can\'t get catalogue ${catalogueUrl}: ` + err.message);
            return [];
        });
    return datasetUrlsForCatalogueUrl;
};

// -------------------------------------------------------------------------------------------------

// async/await does not seem necessary here for final output ...
const get_feeds_all = async (datasetUrlsAll) => {
    let feedsAll =
        await
        axios
        .all
        (Object.entries(datasetUrlsAll).map(async ([catalogueUrl, datasetUrls]) => ({
            [catalogueUrl]: await get_feeds_for_dataset_urls(datasetUrls) // async/await is necessary here for final output
        })))
        .then(x => Object.assign({}, ...x));
    return feedsAll;
};

// -------------------------------------------------------------------------------------------------

// async/await does not seem necessary here for final output ...
const get_feeds_for_dataset_urls = async (datasetUrls) => {
    let feedsForDatasetUrls =
        await
        axios
        .all(datasetUrls.map(async datasetUrl => ({
            [datasetUrl]: await get_feeds_for_dataset_url(datasetUrl) // async/await is necessary here for final output
        })))
        .then(x => Object.assign({}, ...x));
    return feedsForDatasetUrls;
};

// -------------------------------------------------------------------------------------------------

// async/await does not seem necessary here for final output ...
const get_feeds_for_dataset_url = async (datasetUrl) => {
    let feedsForDatasetUrl =
        await
        axios
        .get(datasetUrl)
        .then(dataset => get_jsonld(dataset))
        .then(jsonld => jsonld.distribution.map(feedInfo => ({
            url: feedInfo.contentUrl,
            kind: feedInfo.name,
            datasetName: jsonld.name,
            datasetPublisherName: jsonld.publisher.name,
            discussionUrl: jsonld.discussionUrl,
            licenseUrl: jsonld.license,
        })))
        .catch(err => {
            console.log(`ERROR: Can\'t get dataset ${datasetUrl}: ` + err.message);
            return [];
        });
    return feedsForDatasetUrl;
};

// -------------------------------------------------------------------------------------------------

// async/await does not seem necessary here for final output ...
const get_jsonld = async (dataset) => {

    let jsonld = null;
    let url = null;

    const handler = new Handler(
        (err, res) => {
            jsonld = res.jsonld[0];
            url = res.jsonld[0].url;
        },
        {
            url, // Does not seem necessary, can comment out, also not sure if being filled correctly from previous line anyway
        },
    );

    const parser = new Parser(
        handler,
        {
            decodeEntities: true
        },
    );

    parser.write(await dataset.data);
    parser.done();

    return jsonld;
};

// -------------------------------------------------------------------------------------------------

console.log('Started');

let catalogueUrls = null;
let datasetUrlsAll = null;
let feedsAll = null;

// async/await is necessary here for final output
(async () => {
    catalogueUrls = await get_catalogue_urls(catalogueCollectionUrl);
    datasetUrlsAll = await get_dataset_urls_all(catalogueUrls);
    feedsAll = await get_feeds_all(datasetUrlsAll);
})();

process.on(
	'exit',
	() => {
		console.log('Finished');
        // console.log(catalogueUrls);
        // console.log(datasetUrlsAll);
        // console.log(feedsAll);
        // setTimeout(() => {console.log(catalogueUrls)}, 1000);
        // setTimeout(() => {console.log(datasetUrlsAll)}, 1000);
        // setTimeout(() => {console.log(feedsAll)}, 1000);
        console.dir(feedsAll, {depth: null});
	}
);

// -------------------------------------------------------------------------------------------------
