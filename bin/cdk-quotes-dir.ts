#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkQuotesDirStack } from '../lib/cdk-quotes-create-db-stack';
import {CdkApitack} from '../lib/cdk-quotes-create-api-stack';

const app = new cdk.App();


new CdkApitack(app, 'CdkAPIStack', {
});
