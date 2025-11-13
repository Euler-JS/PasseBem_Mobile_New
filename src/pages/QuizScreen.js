import React, {useState, useEffect, useRef} from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions, Image, BackHandler, Alert, RefreshControl, ActivityIndicator, Platform} from "react-native";
import {StatusBar} from "expo-status-bar";
import { MaterialIcons,  MaterialCommunityIcons, AntDesign} from '@expo/vector-icons';
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
        console.log('🔄 CONVERTENDO URL DA IMAGEM:');
        console.log('📥 URL ANTIGA:', url);
        console.log('📤 URL NOVA:', newUrl);
        return newUrl;
    }
    
    // Se não tem a base da API, assume que é só o nome do arquivo
    if (!url.startsWith('http')) {
        const newUrl = `http://mowosocw4sgwsk84kw4ks40c.62.171.183.132.sslip.io/files/${url}`;
        console.log('🔄 ADICIONANDO BASE URL GITHUB:');
        console.log('📥 FILENAME:', url);
        console.log('📤 URL COMPLETA:', newUrl);
        return newUrl;
    }
    
    return url;
};

function QuizScreen({navigation}) {


    const Route = useRoute();
    const IsFocused = useIsFocused();
    const timerRef = useRef(null);

    const {item, tipo} = Route.params;

    const [quiz, setQuiz] = useState([]);
    const [number, setNumber] = useState(0);
    const [pts, setPts] = useState(0);
    const [failpts,setfailpts] =useState(0)
    const [quizprogress, setquizprogress] = useState(0);
    const [ativetest, setativetest] = useState(false);
    const [emfalta, setemfalta] = useState(25)
    const [prova, setProva] = useState([])
    const [ProvaFeita, setProvaFeita] = useState([])
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutos = 1800 segundos

    const [userOption, setuserOption] = useState("");
    const [activecolor, setactivecolor] = useState("#f0f4fd");
    const [descricao, setdescricao] = useState('')

    const [isLoading, setLoading] = useState(false)
    const [quizStarted, setQuizStarted] = useState(false) // Controla quando o timer deve começar

    // Função para formatar o tempo
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Contador customizado - Usa setInterval para garantir execução contínua
    useEffect(() => {
        if (!quizStarted || quiz.length === 0) {
            console.log('⏸️ TIMER NÃO INICIADO - quizStarted:', quizStarted, 'quiz.length:', quiz.length);
            return;
        }

        console.log('⏱️ INICIANDO INTERVAL - timeLeft:', timeLeft);

        const intervalId = setInterval(() => {
            setTimeLeft((prevTime) => {
                const newTime = prevTime - 1;
                console.log('⏱️ TIMER CONTANDO:', formatTime(newTime), '(', newTime, 'segundos)');
                
                if (newTime <= 0) {
                    console.log('⏰ TEMPO ESGOTADO!');
                    clearInterval(intervalId);
                    Alert.alert("Tempo esgotado!", "O teste foi finalizado automaticamente.");
                    GravarProva();
                    return 0;
                }
                
                return newTime;
            });
        }, 1000);

        return () => {
            console.log('🧹 LIMPANDO INTERVAL');
            clearInterval(intervalId);
        };
    }, [quizStarted, quiz.length]); // Removido timeLeft das dependências

    function Clear(){
        console.log('🧹 CLEAR CHAMADO');
        setQuiz([])
        setNumber(0)
        setquizprogress(0)
        setativetest(false)
        setemfalta(25)
        setuserOption("")
        setactivecolor('#f0f4fd')
        setTimeLeft(1800)
        setQuizStarted(false) // Isso vai parar o interval
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
    
        return () => {
            backHandler.remove();
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [emfalta]);

    function AtivTestF(){
        console.log('🎯 ATIVTESTF CHAMADO - quizStarted:', quizStarted);

        const perct = Math.round((number * 100) / 25)
        const pertual = Math.round(perct) / 100 // Usar valores inteiros
        setquizprogress(Math.min(1, Math.max(0, pertual))) // Garantir entre 0 e 1

        if(quiz[number].answer == userOption){
            setPts(pts + 1)
            setactivecolor("rgba(0, 230, 64, 1)")
        }
        else{
            setfailpts(failpts +1)
            //setactivecolor("red")
        }
        
        /* setativetest(true)
        */

        setemfalta(emfalta-1)

        //
        if(number >= 24){

            GravarProva()
        }

        else NextQuetion()
        
    }

    function NextQuetion(){
        console.log('➡️ AVANÇANDO PARA PRÓXIMA QUESTÃO (QUIZ) - quizStarted:', quizStarted);
        console.log('📍 QUESTÃO ATUAL (QUIZ):', number + 1);
        console.log('🖼️ IMAGE_URL ATUAL (QUIZ):', quiz[number]?.image_url);
        console.log('📝 RESPOSTA ATUAL (QUIZ):', userOption);

        const data = {
            prova: String(prova._id || prova.id || ''), 
            userOption: userOption, 
            numero: number, 
            questao: String(quiz[number]?.id || quiz[number]?._id || '')
        }

        setProvaFeita([...ProvaFeita, data])

        setuserOption("")
        setactivecolor("#f0f4fd")
        
        if(number < quiz.length-1){
            const proximaQuestao = number + 1;
            console.log('🔄 PRÓXIMA QUESTÃO (QUIZ):', proximaQuestao);
            console.log('🖼️ PRÓXIMA IMAGE_URL (QUIZ):', quiz[proximaQuestao]?.image_url);
            setNumber(number +1)
            setativetest(false)
        }
        
        console.log('✅ NextQuetion COMPLETO - quizStarted ainda:', quizStarted);
    }

    useEffect(() => {

        if(IsFocused){
            setdescricao(item.descricao)
            console.log('🚀 INICIANDO QUIZ NORMAL');
            console.log('📋 ITEM RECEBIDO:', item);
            console.log('🏷️ TIPO:', tipo);

            api.post('apptemas',{item, tipo})
                .then(res => {
                    console.log('📊 DADOS COMPLETOS DA API (QUIZ):', res.data);
                    console.log('📝 QUESTÕES RECEBIDAS:', res.data.results);
                    
                    setQuiz(res.data.results.map((item, index) => {
                        const convertedImageUrl = convertImageUrl(item.imagem_url);
                        
                        console.log(`🔍 QUESTÃO ${index + 1} (QUIZ):`, {
                            questao: item.questao,
                            image_url_original: item.imagem_url,
                            image_url_convertida: convertedImageUrl,
                            alternativa_correta: item.alternativa_correta,
                            id: item._id || item.id
                        });
                        
                        return {
                            question: item.questao,
                            options: shuffle([...item.incorecta_alternativas, item.alternativa_correta]),
                            answer: item.alternativa_correta,
                            image_url: convertedImageUrl,
                            id: String(item._id || item.id || Math.random().toString()),
                        }
                    }));
                    setProva(res.data.prova)
                    
                    console.log('✅ QUIZ CARREGADO COM', res.data.results.length, 'questões');
                    
                    // Iniciar o timer
                    setQuizStarted(true);
                    console.log('⏱️ TIMER INICIADO');
                })
                .catch(err => console.error('❌ ERRO AO CARREGAR QUESTÕES:', err))
        }

    }, [IsFocused]);

    // Monitorar mudanças na questão atual do Quiz
    useEffect(() => {
        if(quiz.length > 0 && quiz[number]) {
            console.log('🔄 QUESTÃO MUDOU PARA (QUIZ):', number + 1);
            console.log('🖼️ IMAGE_URL DA QUESTÃO ATUAL (QUIZ):', quiz[number].image_url);
            console.log('❓ PERGUNTA (QUIZ):', quiz[number].question);
            console.log('✅ RESPOSTA CORRETA (QUIZ):', quiz[number].answer);
            console.log('🆔 ID DA QUESTÃO (QUIZ):', quiz[number].id);
        }
    }, [number, quiz]);

    const shuffle = (arr) => arr.sort();

    async function GravarProva(){

        setLoading(true)

        try{
            const response =  await api.post('fazerprova',{ProvaFeita, prova, pts})
            
            alert(response.data.message)

            setLoading(false)

            setNumber(0)

            setProvaFeita([])

            console.log('toreviw :', response.data)
           
            if(pts >= 20){
                
                navigation.navigate('Vitoria', {item: response.data?.data, pts, tipo})
            }
            else{
                navigation.navigate('Derrota', {item: response.data?.data, pts, tipo})
            }
            Clear()


        }catch(err){
            setLoading(false)
            alert('Não foi possivel salvar seu teste!')

        }
       
    }

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

    if(isLoading){
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
                    <MaterialIcons name="close" size={30} color="#999" />
                </TouchableOpacity>
                
                {/* Indicador de progresso melhorado */}
                <View style={{flexDirection: 'column', alignItems: 'center', flex: 1}}>
                    <Text style={{fontSize: 16, color: '#333', fontWeight: 'bold', marginBottom: 4}}>
                        Questão {number + 1} de {quiz.length}
                    </Text>
                    <View style={{
                        width: Math.round(width * 0.7), 
                        height: 6, 
                        backgroundColor: '#e0e0e0', 
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}>
                        <View style={{
                            width: `${Math.round(((number + 1) / quiz.length) * 100)}%`,
                            height: 6,
                            backgroundColor: '#ffa000',
                            borderRadius: 3
                        }} />
                    </View>
                </View>

                <MaterialIcons name="flag" size={30} color="#999" />
            </View>

            {/* Stats Section */}
            <View style={{flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#f5f5f5'}}>
                <View style={{alignItems: 'center'}}>
                    <Text style={{fontSize: 14, color: '#333', fontWeight: 'bold'}}>{pts}</Text>
                    <Text style={{fontSize: 12, color: '#666'}}>Acertos</Text>
                </View>
                <View style={{alignItems: 'center'}}>
                    <Text style={{fontSize: 14, color: '#333', fontWeight: 'bold'}}>{formatTime(timeLeft)}</Text>
                    <Text style={{fontSize: 12, color: '#666'}}>Tempo</Text>
                </View>
                <View style={{alignItems: 'center'}}>
                    <Text style={{fontSize: 14, color: '#333', fontWeight: 'bold'}}>{quiz.length - number - 1}</Text>
                    <Text style={{fontSize: 12, color: '#666'}}>Restam</Text>
                </View>
            </View>

            <View style={{ width:width*0.9, alignSelf:"center", marginTop:height*0}}>
                <View style={{ elevation:2,borderRadius:5, width:width*0.9,  backgroundColor:"#fff", alignSelf:"center", marginTop:height*0.02}}>
                    <Image style={{width:width*0.9, height:height*0.21,borderTopLeftRadius:5, borderTopRightRadius:5, resizeMode:"stretch"}} source={{uri:quiz[number].image_url}} />
                    {console.log(`🖼️ RENDERIZANDO IMAGEM (QUIZ) - Questão ${number + 1}:`, quiz[number].image_url)}
                    {console.log(`📊 ESTADO COMPLETO DA QUESTÃO ${number + 1} (QUIZ):`, quiz[number])}
                    <Text style={{fontWeight:"700", color:"#607d8b", textAlign:"center", marginVertical:height*0.003}}>{`${quiz[number].question}`}</Text>
                    <TouchableOpacity
                        onPress={() => {Alert.alert(
                            'Sobre o tema',
                            `${descricao}`
                        )}}
                        style={{position:'absolute', elevation:5,backgroundColor:'#fff', borderRadius:8}}
                    >
                        <AntDesign name="infocirlceo" size={24} color="#ffa000" />
                    </TouchableOpacity>
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
                                                            minHeight:height*0.06, borderRadius:5, marginBottom:height*0.036}}>
                                                        <Text>{item}</Text>
                                                        </TouchableOpacity>
                                                    ):(
                                                        <>
                                                            {userOption == quiz[number].answer?(
                                                                <TouchableOpacity disabled onPress={() => setuserOption(item)}
                                                                    style={{flexDirection:"row",justifyContent:"space-between", alignItems:"center",paddingHorizontal:width*0.035, elevation:0,backgroundColor:"rgba(0, 230, 64, 0.2)",
                                                                        minHeight:height*0.06, borderRadius:5, marginBottom:height*0.036, borderWidth:2, borderColor:"rgba(0, 230, 64, 1)"}}>
                                                                    <Text>{item}</Text>
                                                                    <MaterialIcons name="check" size={24} color="rgba(0, 230, 64, 9)" />
                                                                </TouchableOpacity>
                                                            ):(
                                                                <TouchableOpacity disabled onPress={() => setuserOption(item)}
                                                                    style={{flexDirection:"row",justifyContent:"space-between", alignItems:"center",paddingHorizontal:width*0.035, elevation:0,backgroundColor:"rgba(207, 0, 15, 0.1)",
                                                                        minHeight:height*0.06, borderRadius:5, marginBottom:height*0.036, borderWidth:2, borderColor:"rgba(207, 0, 15, 1)"}}>
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
                                                        backgroundColor:"#fff", minHeight:height*0.06, borderRadius:5, marginBottom:height*0.036}}>
                                                        <Text>{item}</Text>
                                                    </TouchableOpacity>
                                               ):(
                                                    <>
                                                        {quiz[number].answer == item?(
                                                            <TouchableOpacity disabled onPress={() => setuserOption(item)}  style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center",paddingHorizontal:width*0.035, elevation:2,
                                                            backgroundColor:"#fff", minHeight:height*0.06, borderRadius:5, marginBottom:height*0.036}}>
                                                            <Text>{item}</Text>
                                                            <MaterialIcons name="check" size={24} color="rgba(0, 230, 64, 9)" />
                                                            </TouchableOpacity>
                                                        ):(
                                                            <TouchableOpacity disabled onPress={() => setuserOption(item)}  style={{flexDirection:"row", alignItems:"center",paddingHorizontal:width*0.035, elevation:2,
                                                                backgroundColor:"#fff", minHeight:height*0.06, borderRadius:5, marginBottom:height*0.036}}>
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
                    
                    {/* Painel de estatísticas sem resposta */}
                    <View style={{alignItems: 'center'}}>
                        <Text style={{fontSize: 10, color: '#ddd'}}>Selecione uma resposta</Text>
                        <Text style={{fontSize: 16, fontWeight: 'bold', color: '#607d8b'}}>
                            {pts}/{number}
                        </Text>
                    </View>
                    
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
                            
                            {/* Painel de estatísticas */}
                            <View style={{alignItems: 'center'}}>
                                <Text style={{fontSize: 10, color: '#607d8b'}}>Pontuação</Text>
                                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#607d8b'}}>
                                    {pts}/{number + 1}
                                </Text>
                            </View>
                            
                            <TouchableOpacity onPress={() => AtivTestF()}>
                                <MaterialIcons name="play-circle-fill" size={30} color="#ffa000" />
                            </TouchableOpacity>
                            </>
                        ):(
                            <>
                            <TouchableOpacity disabled >
                                <MaterialIcons name="replay-circle-filled" size={30} color="#fff" />
                            </TouchableOpacity>
                            
                            {/* Painel de estatísticas durante resposta */}
                            <View style={{alignItems: 'center'}}>
                                <Text style={{fontSize: 10, color: '#607d8b'}}>Pontuação</Text>
                                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#607d8b'}}>
                                    {pts}/{number + 1}
                                </Text>
                            </View>
                            
                            <TouchableOpacity onPress={() => NextQuetion()}>
                                <MaterialCommunityIcons name="arrow-right-circle" size={35} color={activecolor} />
                            </TouchableOpacity>
                            </>
                        )}
                    </>
                )}
                
                <View style={{flexDirection:"row", alignItems:"center", position:"absolute", bottom:height*0.06, marginTop:height*0.03}}>
                {/* ProgressBar inferior ocultado para evitar erros de precisão aritmética */}
                <View style={{backgroundColor:"red",borderRadius:20, height:8, width:Math.round(width)+10, marginLeft:-5}} />
                
                
            </View>
                
            </View>

            {/* Timer e Estatísticas */}
            <View style={{position:"absolute", bottom:20, alignSelf:"center", elevation:4}}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                    {/* Estatísticas */}
                    <View style={{backgroundColor: '#fff', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0'}}>
                        <View style={{alignItems: 'center'}}>
                            <Text style={{fontSize: 10, color: '#666'}}>Acertos</Text>
                            <Text style={{fontSize: 16, fontWeight: 'bold', color: '#4caf50'}}>{pts}</Text>
                        </View>
                    </View>
                    
                    <View style={{backgroundColor: '#fff', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0'}}>
                        <View style={{alignItems: 'center'}}>
                            <Text style={{fontSize: 10, color: '#666'}}>Erros</Text>
                            <Text style={{fontSize: 16, fontWeight: 'bold', color: '#f44336'}}>{failpts}</Text>
                        </View>
                    </View>
                    
                    {/* Timer */}
                    <View style={{backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 2, borderColor: timeLeft < 300 ? '#ff4444' : '#607d8b'}}>
                        <View style={{alignItems: 'center'}}>
                            <Text style={{fontSize: 12, color: '#666', marginBottom: 2}}>Tempo Restante</Text>
                            <Text style={{color: timeLeft < 300 ? '#ff4444' : '#607d8b', fontSize: 18, fontWeight: 'bold'}}>
                                {formatTime(timeLeft)}
                            </Text>
                            {timeLeft < 300 && (
                                <Text style={{fontSize: 10, color: '#ff4444', marginTop: 2}}>Atenção!</Text>
                            )}
                        </View>
                    </View>
                    
                    <View style={{backgroundColor: '#fff', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0'}}>
                        <View style={{alignItems: 'center'}}>
                            <Text style={{fontSize: 10, color: '#666'}}>Restam</Text>
                            <Text style={{fontSize: 16, fontWeight: 'bold', color: '#607d8b'}}>{emfalta}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default QuizScreen;