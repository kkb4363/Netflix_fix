import { PathMatch, Route, Routes, useLocation, useMatch, useNavigate, useParams } from "react-router-dom";
import styled from 'styled-components';
import {motion, AnimatePresence,useScroll} from 'framer-motion';
import { useEffect, useState } from "react";
import { makeImagePath } from "../utils";
import { BsFillArrowRightCircleFill , BsFillArrowLeftCircleFill, BsFillPlayCircleFill} from "react-icons/bs";
import { AiFillStar } from "react-icons/ai";
import { useQuery } from "@tanstack/react-query";
import { getMovieSearch, getTvSearch, IGetSearch } from "../api";

const offset = 6;

const Wrapper = styled.div`
background:black;
`
const MovieSlider = styled.div`
position:relative;
top:300px;
`

const TvSlider = styled.div`
position:relative;
top:600px;
`

const SliderText = styled.div`
left:30px;
position:absolute;
font-size:35px;
width:400px;
height:200px;
top:-50px;
font-weight:400;
`
const Row = styled(motion.div)`
display:grid;
gap:5px;
grid-template-columns:repeat(6,1fr);
margin-bottom:5px;
position:absolute;
width:100%;
`
const rowVariants = {
    hidden : (custom:boolean) => ({
      x: custom? window.outerWidth +5 : -window.outerWidth -5 ,
    }),
    visible: {
      x:0,
    },
    exit : (custom:boolean) => ( {
      x: custom? -window.outerWidth -5 : window.outerWidth +5,
    }),
}
const Box = styled(motion.div)<{bgPhoto:string}>` 
background-color:white;
height:200px;
background-image:url(${props => props.bgPhoto});
background-size:cover;
background-position:center center;
font-size:66px;
position:relative;
cursor:pointer;
&:first-child{
  transform-origin:center left;
}
&:last-child{
  transform-origin:center right;
}
`
const boxVariants = {
    normal: {
      scale: 1,
    },
    hover: {
      zIndex:999,
      scale: 1.3,
      y: -80,
      transition: {
        delay: 0.5,
        duaration: 0.1,
        type: "tween",
      },
    },
  };
  const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`
const infoVariants = {
    hover: {
      opacity: 1,
      transition: {
        delay: 0.5,
        duaration: 0.1,
        type: "tween",
      },
    },
  };
  const Prev = styled.button`
  position:absolute;
  font-size:50px;
  background-color:rgba(0,0,0,0);
  left:0;
  top:70px;
  border:rgba(0,0,0,0);
  color:white;
  `
  const Next = styled.button`
  position:absolute;
  font-size:50px;
  background-color:rgba(0,0,0,0);
  right:0;
  top:70px;
  border:rgba(0,0,0,0);
  color:white;
  `
  const Overlay = styled(motion.div)`
  position:absolute;
  top:0;
  width:100%;
  height:200%;
  background-color:rgba(0,0,0,0.5);
  opacity:0;
  `
  const BigMovie = styled(motion.div)`
  position:absolute; 
  width:40vw; 
  height:80vh;
  left:0;
  right:0;
  margin:0 auto;
  border-radius:15px;
  overflow:hidden;
  background-color:${props=>props.theme.black.lighter};
  `
  const BigCover = styled.div`
  width:100%;
  height:400px;
  background-size:cover;
  background-position:center center;
  `
  const BigTitle = styled.h3`
  color:${props => props.theme.white.lighter};
  font-size:35px;
  position:relative;
  top:-25px;
  padding:20px;
  `
  const BigOverView = styled.p`
  padding:20px;
  margin-top:-50px;
  color:${props => props.theme.white.lighter};
  `
  const BigScore = styled.div`
  position:absolute;
  bottom:10px;
  padding:20px;
  color:${props=>props.theme.white.lighter};
  font-size:30px;
  `
  const BigReleaseDate = styled.p`
  padding:20px;
  position:absolute;
  right:0px;
  bottom:10px;
  font-size:30px;
  color:${props=>props.theme.white.lighter};
  `
  const BigPlay = styled.div`
  position:absolute;
  padding:20px;
  bottom:50px;
  font-size:40px;
  border-radius:5px;
  cursor:pointer;
  color:${props=>props.theme.white.lighter};
  `
  const Title = styled.h2`
  font-size:38px;
  display:grid;
  place-items:center;
  min-height:100vh;
  `
  const Overview = styled.p`
  font-size:30px;
  display:grid;
  place-items:center;
  margin-top:-600px;
  `

function Search(){
  const location = useLocation(); {/*현재 url값 가져오기*/}
  const navigate = useNavigate(); {/* url 이동시키기 */}
  const keyword = new URLSearchParams(location.search).get('query'); {/* URLSearchParams는 자바스크립트 함수다. */}
  const {scrollY} = useScroll();

  const {data:movie} = useQuery<IGetSearch>(
    ['movie',keyword], 
    () =>getMovieSearch(keyword+'')); {/*키워드로 검색한 영화 정보 가져오기 */}
  
  const {data:tv} = useQuery<IGetSearch>(
    ['tv',keyword],
    () => getTvSearch(keyword+''),);  {/*키워드로 검색한 티비 정보 가져오기 */}

  {/*버튼 관련 함수들 */}
  const [index, setIndex] = useState(0);
  const [back, setback] = useState(false);
  const [index2, setIndex2] = useState(0)
  const [back2,setback2] = useState(false)
  const PrevBtn = () => {
    if(movie){
      if(leaving) return;
    toggleLeaving();
    const totalMovies = movie.results.length -1;
    const maxIndex2 = Math.floor(totalMovies/offset) -1;
    setIndex((prev) => prev === 0 ? maxIndex2 : prev -1);
    setback(false);
    }
  }
  const NextBtn = () => {
    if(movie){
      if(leaving) return;
    toggleLeaving();
    const totalMovies = movie.results.length -1; {/*영화 개수 알아내기 , -1을 해주는 이유는 이미 메인페이지에 영화 하나 쓰고있으니깐 */}
    const maxIndex = Math.floor(totalMovies/ offset) -1 ; {/* 인덱스의 길이구하기 , Math.ceil은 올림, -1을 해주는 이유는 page가 0에서 시작하기 때문에 */}
    setIndex((prev) => prev === maxIndex ? 0 : prev + 1); 
    setback(true);
}
  };
  const TVPrevBtn = () => {
    if(tv){
      if(leaving) return;
    toggleLeaving();
    const totalMovies = tv.results.length -1;
    const maxIndex2 = Math.floor(totalMovies/offset) -1;
    setIndex2((prev) => prev === 0 ? maxIndex2 : prev -1);
    setback2(false);
    }
  }
  const TVNextBtn = () => {
    if(tv){
      if(leaving) return;
    toggleLeaving();
    const totalMovies = tv.results.length -1; {/*영화 개수 알아내기 , -1을 해주는 이유는 이미 메인페이지에 영화 하나 쓰고있으니깐 */}
    const maxIndex = Math.floor(totalMovies/ offset) -1 ; {/* 인덱스의 길이구하기 , Math.ceil은 올림, -1을 해주는 이유는 page가 0에서 시작하기 때문에 */}
    setIndex2((prev) => prev === maxIndex ? 0 : prev + 1); 
    setback2(true);
}
  };
  const toggleLeaving = () => setLeaving(prev => !prev);
  const [leaving, setLeaving] = useState(false);  

  const onOverlayClick = () => navigate(`/search?query=${keyword}`); {/* search페이지로 옮기는 함수(디테일창 종료) */}
  const onBoxClicked = (SearchId:String) => {navigate(`/search/${SearchId}`);}; {/*클릭한 영화의 id로 주소 변경*/}

  const SearchPathMatch:PathMatch<string>|null = useMatch(`/search/:SearchId`); 
  {/*useMatch는 현재 url상태가 인자값 주소랑 같으면 true 반환*/}
  const clickedMovie = SearchPathMatch?.params.SearchId && movie?.results.find(mov => mov.id+'' === SearchPathMatch.params.SearchId);
  const clickedTv = SearchPathMatch?.params.SearchId && tv?.results.find(tv => tv.id+'' === SearchPathMatch.params.SearchId);
  console.log(keyword)
  

    return (
      <Wrapper>
            <>
          <MovieSlider>
            <SliderText>영화</SliderText>
            <AnimatePresence
            custom={back}
            initial={false}
            onExitComplete={toggleLeaving}>
              <Row
              custom={back}
              variants={rowVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              transition={{type:'tween', duration:0.5}}
              key ={index}>
                {movie?.results.slice(offset*index, offset*index+offset)
                .map((movies) => (
                  <Box
                  layoutId={movies.backdrop_path}
                  variants={boxVariants}
                  key={movies.id}
                  whileHover='hover'
                  initial='normal'
                  onClick={()=> onBoxClicked(movies.id+'')}
                  transition={{type:'tween'}}
                  bgPhoto={makeImagePath(movies.backdrop_path, 'w400' || "")}>
                    <Info variants={infoVariants}>
                      <h4>{movies.title}</h4>
                    </Info>
                  </Box>
                ))}
              </Row>
              <Prev onClick={PrevBtn}><BsFillArrowLeftCircleFill/></Prev>
              <Next onClick={NextBtn}><BsFillArrowRightCircleFill/></Next>
            </AnimatePresence>
          </MovieSlider>

          <TvSlider>
            <SliderText>티비</SliderText>
            <AnimatePresence
            custom={back2}
            initial={false}
            onExitComplete={toggleLeaving}>
              <Row
              custom={back2}
              variants={rowVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              transition={{type:'tween', duration:0.5}}
              key ={index2}>
                {tv?.results.slice(offset*index2, offset*index2+offset)
                .map((movies) => (
                  <Box
                  layoutId={movies.backdrop_path}
                  variants={boxVariants}
                  key={movies.id}
                  whileHover='hover'
                  initial='normal'
                  onClick={()=> onBoxClicked(movies.id+"")}
                  transition={{type:'tween'}}
                  bgPhoto={makeImagePath(movies.backdrop_path, 'w400' || "")}>
                    <Info variants={infoVariants}>
                      <h4>{movies.title}</h4>
                    </Info>
                  </Box>
                ))}
              </Row>
              <Prev onClick={TVPrevBtn}><BsFillArrowLeftCircleFill/></Prev>
              <Next onClick={TVNextBtn}><BsFillArrowRightCircleFill/></Next>
            </AnimatePresence>
          </TvSlider>
      

          <AnimatePresence>
            {SearchPathMatch ?
            <>
            <Overlay
            onClick={onOverlayClick}
            animate={{opacity:1}}
            exit={{opacity:0}}
            />
            <BigMovie
            layoutId={SearchPathMatch.params.MovieId}
            style={{top:scrollY.get()+100}}>

            
            {clickedMovie &&
            <>
            <BigCover 
            style={{
              backgroundImage:`url(${makeImagePath(clickedMovie.backdrop_path, 'w500')})`
              }}/>
            <BigTitle>{clickedMovie.title}</BigTitle>
            <BigOverView>{clickedMovie.overview}</BigOverView>
            <BigScore><AiFillStar/>{clickedMovie.vote_average}</BigScore>
            <BigReleaseDate>{clickedMovie.release_date}</BigReleaseDate>
            <BigPlay><BsFillPlayCircleFill/></BigPlay>
            </>}

            {clickedTv &&
            <>
            <BigCover 
            style={{
              backgroundImage:`url(${makeImagePath(clickedTv.backdrop_path, 'w500')})`
              }}/>
            <BigTitle>{clickedTv.title}</BigTitle>
            <BigOverView>{clickedTv.overview}</BigOverView>
            <BigScore><AiFillStar/>{clickedTv.vote_average}</BigScore>
            <BigReleaseDate>{clickedTv.release_date}</BigReleaseDate>
            <BigPlay><BsFillPlayCircleFill/></BigPlay>
            </>}
            </BigMovie>
            </>
            :null}
          </AnimatePresence>
        </>
          
          
      </Wrapper>
    )
}
export default Search;