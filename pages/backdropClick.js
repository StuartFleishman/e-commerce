
import { Grid, Typography } from '@material-ui/core';
import Layout from '../components/layout';
import db from '../utils/db';
import Product from '../models/Product';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { Store } from '../utils/Store';
import ProductItem from '../components/productitem';

export default function Home(props) {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { topRatedProducts} = props;
  const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };
  return (
    <Layout>

      <Typography variant="h2">Popular Products</Typography>
      <Grid container spacing={3}>
        {topRatedProducts.map((product) => (
          <Grid item md={4} key={product.name}>
            <ProductItem
              product={product}
              addToCartHandler={addToCartHandler}
            />
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const featuredProductsDocs = await Product.find(
    { isFeatured: true },
    '-reviews'
  )
    .lean()
    .limit(3);
  const topRatedProductsDocs = await Product.find({}, '-reviews')
    .lean()
    .sort({
      rating: -1,
    })
    .limit(6);
  await db.disconnect();
  return {
    props: {
      featuredProducts: featuredProductsDocs.map(db.convertDocToObj),
      topRatedProducts: topRatedProductsDocs.map(db.convertDocToObj),
    },
  };
}