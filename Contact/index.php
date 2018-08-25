<?php

    $error = ""; $successMessage = "";

    if ($_POST) {
        
        if (!$_POST["email"]) {
            
            $error .= "An email address is required.<br>";
            
        }
        
        if (!$_POST["content"]) {
            
            $error .= "The content field is required.<br>";
            
        }
        
        if (!$_POST["subject"]) {
            
            $error .= "The subject field is required.<br>";
            
        }
        
        if ($_POST['email'] && filter_var($_POST["email"], FILTER_VALIDATE_EMAIL) === false) {
            
            $error .= "The email address is invalid.<br>";
            
        }
        
        if ($error != "") {
            
            $error = '<div class="alert alert-danger" role="alert"><p>There were error(s) in your form:</p>' . $error . '</div>';
            
        } else {
            
            $emailTo = "edsonaguiar17@gmail.com";
            
            $subject = $_POST['subject'];
            
            $content = $_POST['content'];
            
            $headers = "From: ".$_POST['email'];
            
            if (mail($emailTo, $subject, $content, $headers)) {
                
                $successMessage = '<div class="alert alert-success" role="alert">Your message has been sent, I\'ll get back to you as soon as possible Edson!</div>';
                
                
            } else {
                
                $error = '<div class="alert alert-danger" role="alert"><p><strong>Your message couldn\'t be sent - please try again later</div>';
                
                
            }
            
        }
        
        
        
    }

?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Required meta tags always come first -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="viewport" content="width=device-width">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    	<!--FAVICON-->
		<link rel="shortcut icon" href="http://www.edsonz.domains.trincoll.edu/images/favicon-16x16.png" type="image/png" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.2/css/bootstrap.min.css" integrity="sha384-y3tfxAZXuh4HwSYylfB+J125MxIs6mR5FOHamPBG064zB+AFeWH94NdvaCBm8qnd" crossorigin="anonymous">
  
		<!--FAVICON-->
		<link rel="shortcut icon" href="http://www.edsonz.domains.trincoll.edu/images/favicon-16x16.png" type="image/png" />
        			<link rel="stylesheet" type="text/css" href="Contact.css"/>
        			
        			<!-- Global site tag (gtag.js) - Google Analytics -->
                    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-30871755-5"></script>
                    <script>
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                    
                      gtag('config', 'UA-30871755-5');
                    </script>
        			
  </head>
  <body>
    <!--BEG OF CONTAINER-->  
        <div class="container">
      
            <h1 class="headingOne"><img src="http://edsonz.domains.trincoll.edu/Contact/ContactLogo.png" class="Picture" align="middle"></h1>
                <div class="EmailForm">
                    <div id="error"><? echo $error.$successMessage; ?></div>
              
                        <form method="post">
                              <fieldset class="form-group">
                                <label for="email">Email address</label>
                                <input type="email" class="form-control" id="email" name="email" placeholder="Enter your email address">
                                <small class="text-muted">I'll never share your email with anyone!</small>
                              </fieldset>
                              
                              <fieldset class="form-group">
                                <label for="subject">Subject</label>
                                <input type="text" class="form-control" id="subject" name="subject" >
                              </fieldset>
                              
                              <fieldset class="form-group">
                                <label for="exampleTextarea">Your Message</label>
                                <textarea class="form-control" id="content" name="content" rows="3"></textarea>
                              </fieldset>
                                    <button type="submit" id="submit" class="btn btn-primary">Submit</button>
                        </form>
                  
                </div>
                
                <div class="MoreDetails">
                    <div class="Foto">
                    <img src="https://www.edsonz.domains.trincoll.edu/images/Edson.png" class="Edson" align="middle">
                    </div>
                    
                    <h2>Contact Details</h2>
                    
                    <p id="Salientar">Reach out to Edson </p>
                    
                    <p> <strong>Company:</strong> Trinity College</p>
                    
                    <p> <strong>Address:</strong> 300 Summit St Hartford CT, US</p>
                    
                    <p> <strong>Phone:</strong> 
                        <ul>
                            <li id="dois">&#43;</li>
                            <li id="tres">1</li>
                            <li id="zero">&#40;</li>
                            <li id="um">8</li>
                            <li id="dois">6</li>
                            <li id="tres">0</li>
                            <li id="quatro">&#41;</li>
                            <li id="cinco">2</li>
                            <li id="seis">8</li>
                            <li id="sete">0</li>
                            <li id="oito">&#45;</li>
                            <li id="nove">6</li>
                            <li id="dez">3</li>
                            <li id="onze">8</li>
                            <li id="doze">0</li>
                            
                        </ul>
                    </p>
                    
                    <p> <strong>Fax:</strong> 
                        <ul>
                            <li id="dois">&#43;</li>
                            <li id="tres">1</li>
                            <li id="zero">&#40;</li>
                            <li id="um">8</li>
                            <li id="dois">6</li>
                            <li id="tres">0</li>
                            <li id="quatro">&#41;</li>
                            <li id="cinco">2</li>
                            <li id="seis">9</li>
                            <li id="sete">7</li>
                            <li id="oito">&#45;</li>
                            <li id="nove">3</li>
                            <li id="dez">2</li>
                            <li id="onze">4</li>
                            <li id="doze">4</li>
                            <li id="um">9</li>
                        </ul>
                    </p>
                    
                    <h2>Social Networks</h2>
                    
                    <p1><a target="_blank" title="LinkedIn" href="http://www.linkedin.com/in/edsonzandamela/" style="color: blue; text-decoration: underline;"> LinkedIn</a></p1>
                    
                        
                    <p1><a target="_blank" title="GitHub" href="http://github.com/edsna" style="color: blue; text-decoration: underline;"> GitHub</a></p1>
                    
                    <p1><a target="_blank" title="Google +" href="http://plus.google.com/u/0/+EdsonZandamelaa" style="color: blue; text-decoration: underline;"> Google + </a></p1>
                    
                    <p1>
                        <a target="_blank" title="Twitter" href="http://www.twitter.com/Edsn_Aguiar" style="color: blue; text-decoration: underline;"> Twitter</a>
                    </p1>
                    
                    <p1>
                        <script type="text/javascript" src="https://secure.skypeassets.com/i/scom/js/skype-uri.js">
                            
                        </script>
                        <div id="SkypeButton_Call_edsonaguiar3_1">
                            <script type="text/javascript">
                                 Skype.ui({
                                 "name": "dropdown",
                                 "element": "SkypeButton_Call_edsonaguiar3_1",
                                 "participants": ["edsonaguiar3"]
                                 });
                            </script>
                        </div>
                    </p1>
                    
                    
                </div>
        </div>

    <!-- jQuery first, then Bootstrap JS. -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.2/js/bootstrap.min.js" integrity="sha384-vZ2WRJMwsjRMW/8U7i6PWi6AlO1L79snBrmgiDpgIWJ82z8eA5lenwvxbMV1PAh7" crossorigin="anonymous"></script>
          
          
    <script type="text/javascript">
          
          $("form").submit(function(e) {
              
              var error = "";
              
              if ($("#email").val() == "") {
                  
                  error += "The email field is required.<br>"
                  
              }
              
              if ($("#subject").val() == "") {
                  
                  error += "The subject field is required.<br>"
                  
              }
              
              if ($("#content").val() == "") {
                  
                  error += "The content field is required.<br>"
                  
              }
              
              if (error != "") {
                  
                 $("#error").html('<div class="alert alert-danger" role="alert"><p><strong>There were error(s) in your form:</strong></p>' + error + '</div>');
                  
                  return false;
                  
              } else {
                  
                  return true;
                  
              }
          })
          
    </script>
          
  </body>
</html>