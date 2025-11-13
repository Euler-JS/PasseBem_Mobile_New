import React, {useState, useEffect, useRef} from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions, Image, BackHandler, Alert, RefreshControl, ActivityIndicator, Platform} from "react-native";
import {StatusBar} from "expo-status-bar";
import { MaterialIcons,  MaterialCommunityIcons} from '@expo/vector-icons';
import { Colors } from 'react-native-paper';
import { useRoute, useIsFocused} from "@react-navigation/native";
import LottieView from 'lottie-react-native';

import api from "../services/api"


const { height, width} = Dimensions.get("screen")

// Função para converter URL das imagens
const convertImageUrl = (url) => {
    if (!url) return url;
    
    // Se a URL já está no formato GitHub, retorna como está
    if (url.includes('raw.githubusercontent.com/Euler-JS/passebem_uploads')) {
        return url;
    }
    
    // Se contém a URL antiga da API, substitui pela nova do GitHub
    if (url.includes('https://api.passebem.co.mz/files/')) {
        const fileName = url.replace('https://api.passebem.co.mz/files/', '');
        const newUrl = `http://mowosocw4sgwsk84kw4ks40c.62.171.183.132.sslip.io/files/${fileName}`;
        console.log('🔄 CONVERTENDO URL DA IMAGEM (HISTÓRICO):');
        console.log('📥 URL ANTIGA:', url);
        console.log('📤 URL NOVA:', newUrl);
        return newUrl;
    }
    
    // Se não tem a base da API, assume que é só o nome do arquivo
    if (!url.startsWith('http')) {
        const newUrl = `http://mowosocw4sgwsk84kw4ks40c.62.171.183.132.sslip.io/files/${url}`;
        console.log('🔄 ADICIONANDO BASE URL GITHUB (HISTÓRICO):');
        console.log('📥 FILENAME:', url);
        console.log('📤 URL COMPLETA:', newUrl);
        return newUrl;
    }
    
    return url;
};

function HistQuizScreen({navigation}) {

    const Route = useRoute();

    const IsFocused = useIsFocused();

    const {item, tipo} = Route.params;

    const [quiz, setQuiz] = useState([]);
    const [number, setNumber] = useState(0);
    const [pts, setPts] = useState(0);
    const [failpts,setfailpts] =useState(0)
    const [quizprogress, setquizprogress] = useState(0);
    const [ativetest, setativetest] = useState(true);
    const [emfalta, setemfalta] = useState(25)
    const [prova, setProva] = useState([])
    const [ProvaFeita, setProvaFeita] = useState([])

    const [userOption, setuserOption] = useState("");
    const [activecolor, setactivecolor] = useState("#ffc107");

    function Clear(){
        setQuiz([])
        setNumber(0)
        setquizprogress(0)
        setativetest(false)
        setemfalta(25)
        setuserOption("")
        setactivecolor('#f0f4fd')
    }

    const backAction = () => {
        
        
        Alert.alert("Terminar teste?",`Ainda tem ${emfalta} perguntas não respondidas. Deseja realmente terminar o teste?`, [
          {
            text: "Não",
            onPress: () => null,
            style: "cansel "
          },
          { text: "Sim", onPress: () => navigation.goBack() }
        ]);
        return true;
      };


    useEffect(() => {
        
        
        const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          backAction
        );
    
        return () => backHandler.remove();
      }, [emfalta]);

    function AtivTestF(){

        const perct = (number*100)/25
        const pertual = perct/100
        setquizprogress(pertual)

        if(quiz[number].answer == userOption){
            //setPts(pts + 1)
            //setactivecolor("rgba(0, 230, 64, 1)")
        }
        else{
            setfailpts(failpts +1)
            //setactivecolor("red")
        }
        
        /* setativetest(true)
        
        setemfalta(emfalta-1) */
        

        if(number >= 21){
            
            setNumber(0)
            //setProvaFeita([])
            if(pts >= 20){
                
                navigation.navigate('Vitoria', {item, pts})
            }
            else{
                navigation.navigate('Derrota', {item, pts})
            }
            Clear()
        }
        //NextQuetion()
        
    }

    function NextQuetion(){
        console.log('➡️ AVANÇANDO PARA PRÓXIMA QUESTÃO');
        console.log('📍 QUESTÃO ATUAL:', number);
        console.log('🖼️ IMAGE_URL ATUAL:', quiz[number]?.image_url);
        console.log('📝 RESPOSTA ATUAL:', userOption);

        if(number <= 24){
            const proximaQuestao = number + 1;
            if(quiz[proximaQuestao]) {
                console.log('🔄 PRÓXIMA QUESTÃO:', proximaQuestao);
                console.log('🖼️ PRÓXIMA IMAGE_URL:', quiz[proximaQuestao]?.image_url);
                console.log('📝 PRÓXIMA RESPOSTA:', quiz[proximaQuestao]?.resposta);
                setuserOption(quiz[proximaQuestao].resposta)
            }
        }

        //setactivecolor("#f0f4fd")
        
        if(number < quiz.length-1){
            setNumber(number +1)
            //setativetest(false)
        }
        else{
            alert(`certo:${pts} X errado ${failpts}`)
        }
        AtivTestF()
    }

    useEffect(() => {
        console.log('🚀 INICIANDO CARREGAMENTO DO HISTÓRICO DO QUIZ');
        console.log('📋 ITEM RECEBIDO:', item);
        console.log('🏷️ TIPO:', tipo);

        api.get(`respstaprova/${item._id}`,{item})
            .then(res => {
                console.log('📊 DADOS COMPLETOS DA API:', res.data);
                console.log('📝 RESPOSTAS RECEBIDAS:', res.data.resposta);
                
                setQuiz(res.data.resposta.map((item , index)=> {
                    const convertedImageUrl = convertImageUrl(item.questao.imagem_url);
                    
                    console.log(`🔍 QUESTÃO ${index + 1} (HISTÓRICO):`, {
                        questao: item.questao.questao,
                        image_url_original: item.questao.imagem_url,
                        image_url_convertida: convertedImageUrl,
                        resposta_usuario: item.resposta,
                        resposta_correta: item.questao.alternativa_correta
                    });
                    
                    return {
                        question: item.questao.questao,
                        options: shuffle([...item.questao.incorecta_alternativas, item.questao.alternativa_correta]),
                        answer: item.questao.alternativa_correta,
                        image_url: convertedImageUrl,
                        resposta: item.resposta,
                    }
                }));
                setuserOption(res.data.resposta[0].resposta)
                setPts(res.data.resposta[0].prova.resultado)
                
                console.log('✅ QUIZ CARREGADO COM', res.data.resposta.length, 'questões');
            })
            .catch(err => console.error('❌ ERRO AO CARREGAR DADOS:', err))
            
      }, []);

    // Monitorar mudanças na questão atual
    useEffect(() => {
        if(quiz.length > 0 && quiz[number]) {
            console.log('🔄 QUESTÃO MUDOU PARA:', number + 1);
            console.log('🖼️ IMAGE_URL DA QUESTÃO ATUAL:', quiz[number].image_url);
            console.log('❓ PERGUNTA:', quiz[number].question);
            console.log('✅ RESPOSTA CORRETA:', quiz[number].answer);
            console.log('👤 RESPOSTA DO USUÁRIO:', quiz[number].resposta);
        }
    }, [number, quiz]);

    const shuffle = (arr) => arr.sort();



    if(quiz.length < 1){

        return(
            Platform.OS == 'web'?
            <View style={{flex:1,backgroundColor:"#fff", justifyContent:"center", alignItems:"center",}}>
                <ActivityIndicator size={'large'}/>
            </View>
            :
            <View style={{flex:1,backgroundColor:"#fff", justifyContent:"center", alignItems:"center",}}>
                <LottieView
                autoPlay={true}
                style={{height:height*0.31}}
                source={require('../img/hisquiz.json')}
                />
            </View>
        )
    }

    return (

        <SafeAreaView style={{backgroundColor:"#f0f4fd", flex:1, position:"relative"}}>
            
            <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center", 
                elevation:2, backgroundColor:"#fff",paddingHorizontal:width*0.03, height:height*0.07, marginTop:height*0}}>

                <TouchableOpacity onPress={() => backAction()}>
                    <MaterialIcons name="close" size={30} color="#ddd" />
                </TouchableOpacity>
                
                {/* Indicador de progresso para revisão */}
                <View style={{flexDirection: 'column', alignItems: 'center', flex: 1}}>
                    <Text style={{fontSize: 12, color: '#607d8b', fontWeight: 'bold'}}>
                        Revisão - Questão {number + 1} de {quiz.length}
                    </Text>
                    <View style={{
                        width: Math.round(width * 0.6), 
                        height: 8, 
                        backgroundColor: '#e0e0e0', 
                        borderRadius: 10, 
                        marginTop: 4
                    }}>
                        <View style={{
                            width: Math.round((width * 0.6) * ((number + 1) / quiz.length)),
                            height: 8,
                            backgroundColor: '#ffc107',
                            borderRadius: 10
                        }} />
                    </View>
                </View>
                
                <MaterialIcons name="flag" size={30} color="#ddd" />
            </View>

            <View style={{ width:width*0.9, alignSelf:"center", marginTop:height*0}}>
                <View style={{ elevation:2,borderRadius:5, width:width*0.9,  backgroundColor:"#fff", alignSelf:"center", marginTop:height*0.02}}>
                    <Image style={{width:width*0.9, height:height*0.21,borderTopLeftRadius:5, borderTopRightRadius:5, resizeMode:"stretch"}} source={{uri:quiz[number].image_url}} />
                    {console.log(`🖼️ RENDERIZANDO IMAGEM - Questão ${number + 1}:`, quiz[number].image_url)}
                    {console.log(`📊 ESTADO COMPLETO DA QUESTÃO ${number + 1}:`, quiz[number])}
                    <Text style={{fontWeight:"700", color:"#607d8b", textAlign:"center", marginVertical:height*0.003}}>{`${quiz[number].question}`}</Text>
                </View>
                

                <View style={{marginTop:height*0.04}}>
                    { quiz[number] &&

                        <>
        
                            <View>
                                {quiz[number].options.map((item, index) => (
                                    <View key={index}>
                                    
                                        {userOption == item ?(
                                            <>
                                                {
                                                    ativetest == false ?(
                                                        <TouchableOpacity onPress={() => setuserOption(item)}
                                                        style={{flexDirection:"row", alignItems:"center",paddingHorizontal:width*0.035, elevation:0,backgroundColor:"#607d8b",
                                                            height:height*0.06, borderRadius:5, marginBottom:height*0.036}}>
                                                        <Text>{item}</Text>
                                                        </TouchableOpacity>
                                                    ):(
                                                        <>
                                                            {userOption == quiz[number].answer?(
                                                                <TouchableOpacity disabled onPress={() => setuserOption(item)}
                                                                    style={{flexDirection:"row",justifyContent:"space-between", alignItems:"center",paddingHorizontal:width*0.035, elevation:0,backgroundColor:"rgba(0, 230, 64, 0.2)",
                                                                        height:height*0.06, borderRadius:5, marginBottom:height*0.036, borderWidth:2, borderColor:"rgba(0, 230, 64, 1)"}}>
                                                                    <Text>{item}</Text>
                                                                    <MaterialIcons name="check" size={24} color="rgba(0, 230, 64, 9)" />
                                                                </TouchableOpacity>
                                                            ):(
                                                                <TouchableOpacity disabled onPress={() => setuserOption(item)}
                                                                    style={{flexDirection:"row",justifyContent:"space-between", alignItems:"center",paddingHorizontal:width*0.035, elevation:0,backgroundColor:"rgba(207, 0, 15, 0.1)",
                                                                        height:height*0.06, borderRadius:5, marginBottom:height*0.036, borderWidth:2, borderColor:"rgba(207, 0, 15, 1)"}}>
                                                                    <Text>{item}</Text>
                                                                </TouchableOpacity>
                                                            )}
                                                        </>
                                                    )
                                                }
                                            </>
                                            
                                        ):(
                                            <>
                                               {ativetest == false ?(
                                                   <TouchableOpacity onPress={() => setuserOption(item)}  style={{flexDirection:"row", alignItems:"center",paddingHorizontal:width*0.035, elevation:2,
                                                        backgroundColor:"#fff", height:height*0.06, borderRadius:5, marginBottom:height*0.036}}>
                                                        <Text>{item}</Text>
                                                    </TouchableOpacity>
                                               ):(
                                                    <>
                                                        {quiz[number].answer == item?(
                                                            <TouchableOpacity disabled onPress={() => setuserOption(item)}  style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center",paddingHorizontal:width*0.035, elevation:2,
                                                            backgroundColor:"#fff", height:height*0.06, borderRadius:5, marginBottom:height*0.036}}>
                                                            <Text>{item}</Text>
                                                            <MaterialIcons name="check" size={24} color="rgba(0, 230, 64, 9)" />
                                                            </TouchableOpacity>
                                                        ):(
                                                            <TouchableOpacity disabled onPress={() => setuserOption(item)}  style={{flexDirection:"row", alignItems:"center",paddingHorizontal:width*0.035, elevation:2,
                                                                backgroundColor:"#fff", height:height*0.06, borderRadius:5, marginBottom:height*0.036}}>
                                                                <Text>{item}</Text>
                                                            </TouchableOpacity>
                                                        )}  
                                                    </>
                                                    
                                               )} 
                                            </>
                                            
                                        )}
                                    
                                    </View>
                                    
                                ))}

                            </View>
                        </>

                    }
                    {
                        number === quiz.length && <>
                        <View>
                            <Text>Fim</Text>
                        </View>
                        </>
                    }
                    
                    

                </View>
            </View>

            <View style={{backgroundColor:"#fff",flexDirection:"row", position:"absolute", paddingHorizontal:width*0.05, alignItems:"center",
            justifyContent:"space-between", bottom:0, width:width, height:height*0.07, elevation:4}}>

                
                
                {userOption.trim() == "" ?(
                    <>
                    <TouchableOpacity>
                        <MaterialIcons name="replay-circle-filled" size={30} color="#f0f4fd" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <MaterialIcons name="play-circle-fill" size={30} color="#f0f4fd" />
                    </TouchableOpacity>

                    </>
                ):(
                    <>
                        {ativetest == false ?(
                            <>
                            <TouchableOpacity onPress={() => setuserOption("")}>
                                <MaterialIcons name="replay-circle-filled" size={30} color="#ffa000" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => AtivTestF()}>
                                <MaterialIcons name="play-circle-fill" size={30} color="#ffa000" />
                            </TouchableOpacity>
                            </>
                        ):(
                            <>
                            <TouchableOpacity disabled >
                                <MaterialIcons name="replay-circle-filled" size={30} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => NextQuetion()}>
                                <MaterialCommunityIcons name="arrow-right-circle" size={35} color={activecolor} />
                            </TouchableOpacity>
                            </>
                        )}
                    </>
                )}
                
                <View style={{flexDirection:"row", alignItems:"center", position:"absolute", bottom:48, marginTop:24}}>
                {/* ProgressBar inferior ocultado para evitar erros de precisão aritmética */}
                <View style={{backgroundColor:"red",borderRadius:20, height:8, width:Math.round(width)+10, marginLeft:-5}} />
                
                
            </View>
                
            </View>

            {/* <View style={{position:"absolute", bottom:0, alignSelf:"center", elevation:4}}>
                <CountDown
                    until={60 * 60 + 0}
                    size={12}
                    onFinish={() => alert('Finished')}
                    digitStyle={{backgroundColor: '#f0f4fd'}}
                    digitTxtStyle={{color: 'red'}}
                    timeToShow={['M', 'S']}
                    timeLabels={{m: 'MM', s: 'SS'}}
                />
            </View> */}
        </SafeAreaView>
    )
}

export default HistQuizScreen;